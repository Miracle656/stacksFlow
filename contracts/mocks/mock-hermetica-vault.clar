;; @contract mock-hermetica-vault
(define-data-var claim-nonce uint u0)

(define-map claims
  { claim-id: uint }
  { amount: uint }
)

(define-public (deposit (amount uint) (affiliate (optional (buff 64))))
  (begin
    ;; Transfer sBTC from caller to this contract
    (try! (contract-call? .sbtc-token transfer amount contract-caller (as-contract tx-sender) none))
    ;; Mint hBTC to caller
    (try! (contract-call? .mock-hermetica-token mint amount contract-caller))
    (ok true)
  )
)

(define-public (request-redeem (shares uint) (is-express bool))
  (let ((new-id (+ (var-get claim-nonce) u1)))
    (var-set claim-nonce new-id)
    ;; Burn hBTC from caller
    (try! (contract-call? .mock-hermetica-token burn shares contract-caller))
    (map-set claims { claim-id: new-id } { amount: shares })
    (ok new-id)
  )
)

(define-public (fund-claim (claim-id uint))
  (ok true)
)

(define-public (redeem (claim-id uint))
  (let (
    (claim-record (unwrap-panic (map-get? claims { claim-id: claim-id })))
    (amount-to-return (get amount claim-record))
    (recipient contract-caller)
  )
    ;; Mock 1:1 payout - return sBTC to caller
    (try! (as-contract (contract-call? .sbtc-token transfer amount-to-return tx-sender recipient none)))
    (ok amount-to-return)
  )
)
