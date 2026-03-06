;; @contract mock-zest-market
;; Simplified mock for Zest Protocol market - no trait parameter needed for simnet

(define-public (supply-collateral-add (amount uint) (min-shares uint))
  (begin
    ;; Transfer sBTC from contract-caller to this contract (simulating deposit)
    (try! (contract-call? .sbtc-token transfer amount contract-caller (as-contract tx-sender) none))
    ;; Mint zsBTC to the caller
    (try! (contract-call? .v0-vault-sbtc mint amount contract-caller))
    (ok true)
  )
)

(define-public (collateral-remove-redeem (shares uint) (min-underlying uint) (receiver (optional principal)))
  (let ((recv (match receiver r r contract-caller)))
    ;; Burn zsBTC from caller
    (try! (contract-call? .v0-vault-sbtc burn shares contract-caller))
    ;; Return sBTC to receiver
    (try! (as-contract (contract-call? .sbtc-token transfer shares tx-sender recv none)))
    (ok true)
  )
)
