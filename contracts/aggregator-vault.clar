;; @contract aggregator-vault
;; @version 1
;; Core vault orchestration for agBTC Yield Aggregator

;; --- Constants & Errors ---

(define-constant ERR-UNAUTHORIZED (err u5000))
(define-constant ERR-PAUSED (err u5001))
(define-constant ERR-INSUFFICIENT-FUNDS (err u5002))
(define-constant ERR-INVALID-AMOUNT (err u5003))
(define-constant ERR-BELOW-MIN-DEPOSIT (err u5004))
(define-constant ERR-CLAIM-NOT-FOUND (err u5005))
(define-constant ERR-CLAIM-NOT-READY (err u5006))
(define-constant ERR-SLIPPAGE (err u5007))
(define-constant ERR-ROUTE-FAILED (err u5008))

;; On-chain constants retrieved during planning phase
(define-constant HERMETICA-COOLDOWN u432)    ;; 3 days in Stacks blocks (10m/block)
(define-constant MIN-DEPOSIT u1000)          ;; 1000 sats (0.00001 BTC)

;; --- Data Variables & Maps ---

(define-data-var owner principal tx-sender)
(define-data-var guardian principal tx-sender)
(define-data-var rebalancer principal tx-sender)

(define-data-var deposits-enabled bool true)
(define-data-var withdrawals-enabled bool true)

(define-data-var total-assets uint u0)   ;; Total sBTC controlled by protocol
(define-data-var claim-nonce uint u0)    ;; Auto-incrementing ID for claims

;; withdrawal claims map
(define-map withdrawal-claims
  { claim-id: uint }
  {
    owner: principal,
    shares-burned: uint,        ;; agBTC burned
    sbtc-owed: uint,            ;; sBTC to be paid out
    unlock-timestamp: uint,     ;; When it can be claimed (0 if instant)
    hermetica-claim-id: (optional uint), ;; If Hermetica was hit
    status: (string-ascii 16)   ;; "pending", "ready", "complete"
  }
)

;; --- Read-Only Functions ---

(define-read-only (get-total-assets)
  (var-get total-assets)
)

(define-read-only (get-claim (claim-id uint))
  (map-get? withdrawal-claims { claim-id: claim-id })
)

;; Calculates the sBTC value of a given amount of agBTC shares
(define-read-only (get-share-price (shares uint))
  (let (
    (total-supply (unwrap-panic (contract-call? .token-agbtc get-total-supply)))
    (assets (var-get total-assets))
  )
    (if (is-eq total-supply u0)
      shares ;; 1:1 on first deposit
      (/ (* shares assets) total-supply)
    )
  )
)

;; Inverse: calculates how many agBTC to mint for a given sBTC deposit
(define-read-only (get-mint-amount (assets uint))
  (let (
    (total-supply (unwrap-panic (contract-call? .token-agbtc get-total-supply)))
    (current-assets (var-get total-assets))
  )
    (if (is-eq total-supply u0)
      assets ;; 1:1 on first deposit
      (/ (* assets total-supply) current-assets)
    )
  )
)

;; --- Core Logic ---

;; Deposit sBTC and receive agBTC shares
;; Routes 50/50 to Zest and Hermetica
;; Uses direct call to .sbtc-token (local mock) instead of trait dispatch
(define-public (deposit (sbtc-amount uint))
  (let (
    (caller contract-caller)
    (shares-to-mint (get-mint-amount sbtc-amount))
    ;; 50/50 routing hardcoded for v1
    (amount-half (/ sbtc-amount u2))
  )
    (asserts! (var-get deposits-enabled) ERR-PAUSED)
    (asserts! (>= sbtc-amount MIN-DEPOSIT) ERR-BELOW-MIN-DEPOSIT)

    ;; 1. Transfer sBTC from user -> vault
    (try! (contract-call? .sbtc-token transfer sbtc-amount caller (as-contract tx-sender) none))

    ;; 2. Mint agBTC to user
    (try! (as-contract (contract-call? .token-agbtc mint shares-to-mint caller)))

    ;; 3. Update total assets
    (var-set total-assets (+ (var-get total-assets) sbtc-amount))

    ;; 4. Route 50% to Zest
    (try! (as-contract (contract-call? .sbtc-token transfer amount-half tx-sender .strategy-zest none)))
    (try! (as-contract (contract-call? .strategy-zest deposit amount-half)))

    ;; 5. Route 50% to Hermetica
    (let ((remainder (- sbtc-amount amount-half)))
      (try! (as-contract (contract-call? .sbtc-token transfer remainder tx-sender .strategy-hermetica none)))
      (try! (as-contract (contract-call? .strategy-hermetica deposit remainder)))
    )

    (ok shares-to-mint)
  )
)

;; Request to withdraw by burning agBTC
(define-public (request-withdraw (shares uint))
  (let (
    (caller contract-caller)
    (sbtc-owed (get-share-price shares))
    (zest-balance (unwrap-panic (contract-call? .strategy-zest get-sbtc-balance)))
    (new-claim-id (+ (var-get claim-nonce) u1))
  )
    (asserts! (var-get withdrawals-enabled) ERR-PAUSED)
    (asserts! (> shares u0) ERR-INVALID-AMOUNT)

    ;; 1. Burn user's agBTC
    (try! (contract-call? .token-agbtc burn shares caller))
    (var-set total-assets (- (var-get total-assets) sbtc-owed))
    (var-set claim-nonce new-claim-id)

    ;; 2. Route withdrawal
    (if (<= sbtc-owed zest-balance)
      ;; Instant path: pull from Zest
      (begin
        (try! (as-contract (contract-call? .strategy-zest withdraw sbtc-owed)))
        (map-set withdrawal-claims { claim-id: new-claim-id } {
          owner: caller,
          shares-burned: shares,
          sbtc-owed: sbtc-owed,
          unlock-timestamp: u0,
          hermetica-claim-id: none,
          status: "ready"
        })
        (ok new-claim-id)
      )
      ;; Cooldown path: pull from Hermetica + Zest
      (let (
        (from-zest zest-balance)
        (from-hermetica (- sbtc-owed zest-balance))
        (herm-claim (try! (as-contract (contract-call? .strategy-hermetica request-redeem from-hermetica))))
      )
        (if (> from-zest u0)
          (try! (as-contract (contract-call? .strategy-zest withdraw from-zest)))
          true
        )
        (map-set withdrawal-claims { claim-id: new-claim-id } {
          owner: caller,
          shares-burned: shares,
          sbtc-owed: sbtc-owed,
          unlock-timestamp: (+ burn-block-height HERMETICA-COOLDOWN),
          hermetica-claim-id: (some herm-claim),
          status: "pending"
        })
        (ok new-claim-id)
      )
    )
  )
)

;; Complete a withdrawal claim and send sBTC to the user
(define-public (complete-withdraw (claim-id uint))
  (let (
    (claim (unwrap! (get-claim claim-id) ERR-CLAIM-NOT-FOUND))
    (caller contract-caller)
  )
    (asserts! (var-get withdrawals-enabled) ERR-PAUSED)
    (asserts! (is-eq (get owner claim) caller) ERR-UNAUTHORIZED)
    (asserts! (not (is-eq (get status claim) "complete")) ERR-CLAIM-NOT-FOUND)

    (if (is-eq (get status claim) "pending")
      (begin
        (asserts! (>= burn-block-height (get unlock-timestamp claim)) ERR-CLAIM-NOT-READY)
        (let ((herm-id (unwrap-panic (get hermetica-claim-id claim))))
          (try! (contract-call? .strategy-hermetica fund-claim herm-id))
          (try! (contract-call? .strategy-hermetica complete-redeem herm-id))
          ;; Strategy Hermetica now automatically forwards the redeemed sBTC to the aggregator vault
        )
      )
      true
    )

    (try! (as-contract (contract-call? .sbtc-token transfer (get sbtc-owed claim) tx-sender caller none)))

    (map-set withdrawal-claims { claim-id: claim-id }
      (merge claim { status: "complete" })
    )

    (ok (get sbtc-owed claim))
  )
)

;; --- Admin Functions ---

(define-public (set-deposits-enabled (enabled bool))
  (begin
    (asserts! (or (is-eq tx-sender (var-get owner)) (is-eq tx-sender (var-get guardian))) ERR-UNAUTHORIZED)
    (var-set deposits-enabled enabled)
    (ok true)
  )
)

(define-public (set-withdrawals-enabled (enabled bool))
  (begin
    (asserts! (or (is-eq tx-sender (var-get owner)) (is-eq tx-sender (var-get guardian))) ERR-UNAUTHORIZED)
    (var-set withdrawals-enabled enabled)
    (ok true)
  )
)

(define-public (set-roles (new-owner principal) (new-guardian principal) (new-rebalancer principal))
  (begin
    (asserts! (is-eq tx-sender (var-get owner)) ERR-UNAUTHORIZED)
    (var-set owner new-owner)
    (var-set guardian new-guardian)
    (var-set rebalancer new-rebalancer)
    (ok true)
  )
)
