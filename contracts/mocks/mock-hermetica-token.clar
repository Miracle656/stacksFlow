;; @contract mock-hermetica-token
;; Simplified SIP-010 fungible token mock for simnet testing

(define-fungible-token hbtc)

(define-public (transfer (amount uint) (sender principal) (recipient principal) (memo (optional (buff 34))))
  (begin
    (asserts! (is-eq tx-sender sender) (err u1))
    (ft-transfer? hbtc amount sender recipient)
  )
)
(define-read-only (get-name) (ok "Hermetica BTC"))
(define-read-only (get-symbol) (ok "hBTC"))
(define-read-only (get-decimals) (ok u8))
(define-read-only (get-balance (who principal)) (ok (ft-get-balance hbtc who)))
(define-read-only (get-total-supply) (ok (ft-get-supply hbtc)))
(define-read-only (get-token-uri) (ok (some u"https://hermetica.fi")))

(define-public (mint (amount uint) (recipient principal))
  (ft-mint? hbtc amount recipient)
)
(define-public (burn (amount uint) (owner principal))
  (ft-burn? hbtc amount owner)
)
