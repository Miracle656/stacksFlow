;; @contract mock-zest-vault
;; Simplified SIP-010 fungible token mock for simnet testing

(define-fungible-token zsbtc)

(define-public (transfer (amount uint) (sender principal) (recipient principal) (memo (optional (buff 34))))
  (begin
    (asserts! (is-eq tx-sender sender) (err u1))
    (ft-transfer? zsbtc amount sender recipient)
  )
)
(define-read-only (get-name) (ok "zest sBTC"))
(define-read-only (get-symbol) (ok "zsBTC"))
(define-read-only (get-decimals) (ok u8))
(define-read-only (get-balance (who principal)) (ok (ft-get-balance zsbtc who)))
(define-read-only (get-total-supply) (ok (ft-get-supply zsbtc)))
(define-read-only (get-token-uri) (ok (some u"https://app.zestprotocol.com")))

(define-public (mint (amount uint) (recipient principal))
  (ft-mint? zsbtc amount recipient)
)
(define-public (burn (amount uint) (owner principal))
  (ft-burn? zsbtc amount owner)
)

(define-read-only (convert-to-assets (shares uint))
  (ok (* shares u1)) ;; 1:1 for mock
)
