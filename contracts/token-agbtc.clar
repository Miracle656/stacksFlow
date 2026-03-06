;; @contract token-agbtc
;; @version 1
;; SIP-010 share token for the sBTC Yield Aggregator
;; Note: impl-trait omitted for simnet compatibility (no mainnet address resolution)

(define-fungible-token agbtc)

;; --- Constants ---
(define-constant ERR-UNAUTHORIZED (err u1000))

;; Minter is set once at deploy time to the aggregator-vault contract
(define-data-var minter principal tx-sender)

;; --- SIP-010 Functions ---

(define-public (transfer (amount uint) (sender principal) (recipient principal) (memo (optional (buff 34))))
  (begin
    (asserts! (is-eq tx-sender sender) ERR-UNAUTHORIZED)
    (try! (ft-transfer? agbtc amount sender recipient))
    (match memo to-print (print to-print) 0x)
    (ok true)
  )
)

(define-read-only (get-name)
  (ok "Aggregator BTC")
)

(define-read-only (get-symbol)
  (ok "agBTC")
)

(define-read-only (get-decimals)
  (ok u8)
)

(define-read-only (get-balance (who principal))
  (ok (ft-get-balance agbtc who))
)

(define-read-only (get-total-supply)
  (ok (ft-get-supply agbtc))
)

(define-read-only (get-token-uri)
  (ok none)
)

;; --- Admin ---
(define-public (set-minter (new-minter principal))
  (begin
    (asserts! (is-eq tx-sender (var-get minter)) ERR-UNAUTHORIZED)
    (ok (var-set minter new-minter))
  )
)

;; --- Mint/Burn logic (only callable by aggregator-vault) ---

(define-public (mint (amount uint) (recipient principal))
  (begin
    (asserts! (is-eq contract-caller (var-get minter)) ERR-UNAUTHORIZED)
    (ft-mint? agbtc amount recipient)
  )
)

(define-public (burn (amount uint) (owner principal))
  (begin
    (asserts! (is-eq contract-caller (var-get minter)) ERR-UNAUTHORIZED)
    (ft-burn? agbtc amount owner)
  )
)
