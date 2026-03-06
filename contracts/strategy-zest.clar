;; @contract strategy-zest
;; @version 1
;; Adapter for Zest Protocol v2 lending market

;; --- Constants & Errors ---

(define-constant ERR-UNAUTHORIZED (err u3000))

;; Vault address is set once at deploy time to the aggregator-vault contract
(define-data-var vault-address principal tx-sender)

;; Zest v2 mainnet components (mocked locally)

;; --- Admin ---
(define-public (set-vault-address (new-vault principal))
  (begin
    (asserts! (is-eq tx-sender (var-get vault-address)) ERR-UNAUTHORIZED)
    (ok (var-set vault-address new-vault))
  )
)

;; --- Core Vault Integration ---

;; Deposit sBTC into Zest to receive zsBTC
(define-public (deposit (amount uint))
  (begin
    (asserts! (is-eq contract-caller (var-get vault-address)) ERR-UNAUTHORIZED)
    
    ;; We use as-contract because the adapter needs to own the zsBTC
    (as-contract 
      (contract-call? .v0-4-market supply-collateral-add 
        amount  ;; Amount of sBTC to deposit
        u0      ;; min-shares
      )
    )
  )
)

;; Withdraw sBTC from Zest by giving up zsBTC
(define-public (withdraw (shares uint))
  (begin
    (asserts! (is-eq contract-caller (var-get vault-address)) ERR-UNAUTHORIZED)
    
    (as-contract
      (contract-call? .v0-4-market collateral-remove-redeem
        shares  ;; Amount of zsBTC to redeem
        u0      ;; min-underlying
        (some (var-get vault-address)) ;; receiver
      )
    )
  )
)

;; --- Read-Only Metrics ---

;; Gets current APY in basis points (10000 = 100%)
;; NOTE: Reading the exact supply rate requires passing the active asset state.
;; For v1 of the aggregator, this is returned as a 0 stub since complex 
;; off-chain oracle reading is required to compute real-time dynamic APY.
;; A production version would read the reserve-data contract.
(define-read-only (get-current-apy)
  (ok u350) ;; Stub: ~3.5%
)

;; Gets the sBTC equivalent of all zsBTC held by this adapter
;; Returns raw zsBTC shares (1:1 backed in Zest v2 at all times)
(define-public (get-sbtc-balance)
  (contract-call? .v0-vault-sbtc get-balance .strategy-zest)
)

;; Helper to get raw zsBTC shares
(define-public (get-zsbtc-balance)
  (contract-call? .v0-vault-sbtc get-balance .strategy-zest)
)
