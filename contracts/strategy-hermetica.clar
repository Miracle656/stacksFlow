;; @contract strategy-hermetica
;; @version 1
;; Adapter for Hermetica hBTC vault (delta-neutral yield)

;; --- Constants & Errors ---

(define-constant ERR-UNAUTHORIZED (err u4000))

;; Vault address is set once at deploy time to the aggregator-vault contract
(define-data-var vault-address principal tx-sender)

;; Hermetica mainnet components (mocked locally)

;; --- Admin ---
(define-public (set-vault-address (new-vault principal))
  (begin
    (asserts! (is-eq tx-sender (var-get vault-address)) ERR-UNAUTHORIZED)
    (ok (var-set vault-address new-vault))
  )
)

;; --- Core Vault Integration ---

;; Deposit sBTC into Hermetica to receive hBTC shares
;; Note: hBTC deposit uses `contract-caller` as the depositor.
(define-public (deposit (amount uint))
  (begin
    (asserts! (is-eq contract-caller (var-get vault-address)) ERR-UNAUTHORIZED)
    
    ;; deposit(amount, affiliate-address)
    (as-contract 
      (contract-call? .vault-hbtc-v1 deposit amount none)
    )
  )
)

;; Step 1 of Redemption: Request to withdraw hBTC shares
;; Returns the (ok claim-id) from the vault
(define-public (request-redeem (shares uint))
  (begin
    (asserts! (is-eq contract-caller (var-get vault-address)) ERR-UNAUTHORIZED)
    
    (as-contract
      ;; request-redeem(shares, is-express)
      (contract-call? .vault-hbtc-v1 request-redeem shares false)
    )
  )
)

;; Step 2 of Redemption: Fund the claim (Usually called by bots, but we expose it)
(define-public (fund-claim (claim-id uint))
  (begin
    (asserts! (is-eq contract-caller (var-get vault-address)) ERR-UNAUTHORIZED)
    
    ;; Anyone can fund, but it must be ready
    (contract-call? .vault-hbtc-v1 fund-claim claim-id)
  )
)

;; Step 3 of Redemption: Actually withdraw the sBTC to the aggregator
(define-public (complete-redeem (claim-id uint))
  (begin
    (asserts! (is-eq contract-caller (var-get vault-address)) ERR-UNAUTHORIZED)
    
    (let ((start-bal (unwrap-panic (contract-call? .sbtc-token get-balance (as-contract tx-sender)))))
      (try! (as-contract (contract-call? .vault-hbtc-v1 redeem claim-id)))
      (let ((end-bal (unwrap-panic (contract-call? .sbtc-token get-balance (as-contract tx-sender)))))
        (as-contract (contract-call? .sbtc-token transfer (- end-bal start-bal) tx-sender (var-get vault-address) none))
      )
    )
  )
)

;; --- Read-Only Metrics ---

;; Gets current APY in basis points
(define-read-only (get-current-apy)
  (ok u1200) ;; Stub: ~12.0%
)

;; Gets the sBTC equivalent of all hBTC held by this adapter
(define-public (get-sbtc-balance)
  (let (
    (shares (unwrap-panic (contract-call? .mock-hermetica-token get-balance .strategy-hermetica)))
    (pps (unwrap-panic (contract-call? .state-hbtc-v1 get-price-per-share)))
  )
    ;; shares * pps / 1e8 maps to underlying sBTC values
    (ok (/ (* shares pps) u100000000))
  )
)

;; Helper to get raw hBTC shares
(define-public (get-hbtc-balance)
  (contract-call? .mock-hermetica-token get-balance .strategy-hermetica)
)
