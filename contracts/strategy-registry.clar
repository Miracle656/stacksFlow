;; @contract strategy-registry
;; @version 1
;; Stores configuration for yield strategies (Zest, Hermetica)

;; --- Constants & Errors ---

(define-constant ERR-UNAUTHORIZED (err u2000))
(define-constant ERR-STRATEGY-NOT-FOUND (err u2001))
(define-constant ERR-INVALID-WEIGHT (err u2002))
(define-constant ERR-MAX-STRATEGIES (err u2003))

(define-constant CONTRACT-OWNER tx-sender)

;; --- Data Variables & Maps ---

(define-data-var strategy-count uint u0)
(define-data-var total-weight-bps uint u0)

(define-map strategies
  { id: uint }
  {
    name: (string-ascii 32),
    contract: principal,
    weight-bps: uint,        ;; 10000 = 100%
    is-active: bool,
    total-deposited: uint,
    last-apy-snapshot: uint
  }
)

;; --- Read-Only Functions ---

(define-read-only (get-strategy (id uint))
  (map-get? strategies { id: id })
)

(define-read-only (get-strategy-count)
  (var-get strategy-count)
)

(define-read-only (get-total-weight)
  (var-get total-weight-bps)
)

;; The vault needs to fetch all strategies to route deposits
(define-read-only (get-all-active-strategies)
  (let ((count (var-get strategy-count)))
    ;; Return up to 5 strategies max 
    (filter active-filter (map read-strategy (list u1 u2 u3 u4 u5)))
  )
)

(define-private (read-strategy (id uint))
  (default-to 
    { name: "", contract: tx-sender, weight-bps: u0, is-active: false, total-deposited: u0, last-apy-snapshot: u0 } 
    (map-get? strategies { id: id })
  )
)

(define-private (active-filter (strat { name: (string-ascii 32), contract: principal, weight-bps: uint, is-active: bool, total-deposited: uint, last-apy-snapshot: uint }))
  (get is-active strat)
)

;; --- Owner Admin Functions ---

(define-public (add-strategy (name (string-ascii 32)) (contract principal) (weight-bps uint))
  (let (
    (new-id (+ (var-get strategy-count) u1))
    (current-total (var-get total-weight-bps))
  )
    (asserts! (is-eq contract-caller CONTRACT-OWNER) ERR-UNAUTHORIZED)
    (asserts! (<= new-id u5) ERR-MAX-STRATEGIES)
    (asserts! (<= (+ current-total weight-bps) u10000) ERR-INVALID-WEIGHT)

    (map-set strategies { id: new-id } {
      name: name,
      contract: contract,
      weight-bps: weight-bps,
      is-active: true,
      total-deposited: u0,
      last-apy-snapshot: u0
    })

    (var-set strategy-count new-id)
    (var-set total-weight-bps (+ current-total weight-bps))
    (ok new-id)
  )
)

(define-public (update-weight (id uint) (new-weight uint))
  (let (
    (strat (unwrap! (get-strategy id) ERR-STRATEGY-NOT-FOUND))
    (current-total (var-get total-weight-bps))
    (old-weight (get weight-bps strat))
    (new-total (+ (- current-total old-weight) new-weight))
  )
    (asserts! (is-eq contract-caller CONTRACT-OWNER) ERR-UNAUTHORIZED)
    (asserts! (<= new-total u10000) ERR-INVALID-WEIGHT)

    (map-set strategies { id: id } (merge strat { weight-bps: new-weight }))
    (var-set total-weight-bps new-total)
    (ok true)
  )
)

(define-public (deactivate-strategy (id uint))
  (let (
    (strat (unwrap! (get-strategy id) ERR-STRATEGY-NOT-FOUND))
    (old-weight (get weight-bps strat))
  )
    (asserts! (is-eq contract-caller CONTRACT-OWNER) ERR-UNAUTHORIZED)
    
    (map-set strategies { id: id } (merge strat { is-active: false, weight-bps: u0 }))
    (var-set total-weight-bps (- (var-get total-weight-bps) old-weight))
    (ok true)
  )
)

;; --- Vault Protocol Functions ---

(define-public (update-strategy-metrics (id uint) (deposited-delta int) (new-apy uint))
  (let (
    (strat (unwrap! (get-strategy id) ERR-STRATEGY-NOT-FOUND))
    (current-deposited (get total-deposited strat))
    (new-deposited (if (< deposited-delta 0)
                     (- current-deposited (to-uint (- 0 deposited-delta)))
                     (+ current-deposited (to-uint deposited-delta))))
  )
    (asserts! (is-eq contract-caller .aggregator-vault) ERR-UNAUTHORIZED)
    
    (map-set strategies { id: id } 
      (merge strat { total-deposited: new-deposited, last-apy-snapshot: new-apy })
    )
    (ok true)
  )
)
