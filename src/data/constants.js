export const STAFF = [
  { id: 'A', name: 'Employee A', role: 'Manager / Lead', avatarClass: 'av-a', fillColor: '#378ADD' },
  { id: 'B', name: 'Employee B', role: 'Barista', avatarClass: 'av-b', fillColor: '#1D9E75' },
  { id: 'C', name: 'Employee C', role: 'Barista', avatarClass: 'av-c', fillColor: '#BA7517' },
]

export const DAYS_SHORT = ['Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

export const TOTAL_HOLIDAY_HOURS = 122
export const SHIFT_HOURS = 6

export const CELL_CYCLE = ['work', 'weekend', 'off']

export const CELL_CONFIG = {
  work:    { bg: '#E1F5EE', color: '#0F6E56', label: '9–3:20', legendColor: '#5DCAA5' },
  weekend: { bg: '#EAF3DE', color: '#3B6D11', label: '9–3:20', legendColor: '#97C459' },
  off:     { bg: '#F0F0F0', color: '#9B9B9B', label: 'OFF',    legendColor: '#D0D0D0' },
  holiday: { bg: '#FAEEDA', color: '#854F0B', label: 'HOL',    legendColor: '#EF9F27' },
}

export const INITIAL_ROTA = [
  [
    { A: 'work', B: 'work',    C: 'work'    },
    { A: 'work', B: 'work',    C: 'work'    },
    { A: 'work', B: 'work',    C: 'off'     },
    { A: 'work', B: 'off',     C: 'work'    },
    { A: 'work', B: 'weekend', C: 'off'     },
    { A: 'off',  B: 'off',     C: 'weekend' },
  ],
  [
    { A: 'work', B: 'work',    C: 'work' },
    { A: 'work', B: 'off',     C: 'work' },
    { A: 'off',  B: 'work',    C: 'work' },
    { A: 'work', B: 'work',    C: 'off'  },
    { A: 'off',  B: 'weekend', C: 'work' },
    { A: 'work', B: 'off',     C: 'off'  },
  ],
  [
    { A: 'off',     B: 'work', C: 'work' },
    { A: 'work',    B: 'work', C: 'work' },
    { A: 'work',    B: 'work', C: 'off'  },
    { A: 'work',    B: 'off',  C: 'work' },
    { A: 'weekend', B: 'off',  C: 'work' },
    { A: 'work',    B: 'work', C: 'off'  },
  ],
  [
    { A: 'work', B: 'work',    C: 'work'    },
    { A: 'work', B: 'work',    C: 'off'     },
    { A: 'work', B: 'off',     C: 'work'    },
    { A: 'off',  B: 'work',    C: 'work'    },
    { A: 'work', B: 'weekend', C: 'off'     },
    { A: 'off',  B: 'off',     C: 'weekend' },
  ],
]

export const INITIAL_HOLIDAYS = [
  { id: '1', employee: 'B', from: '2025-08-04', to: '2025-08-08', hours: 24, status: 'approved' },
  { id: '2', employee: 'C', from: '2025-09-01', to: '2025-09-05', hours: 24, status: 'pending'  },
  { id: '3', employee: 'A', from: '2025-07-21', to: '2025-07-21', hours: 6,  status: 'approved' },
]

export const POLICY_RULES = [
  { icon: '⏰', text: 'Standard shift hours',           val: '9:00am – 3:20pm (6 paid hrs)'              },
  { icon: '☕', text: 'Break per shift',                 val: '20 min unpaid (or 2× 10 min)'              },
  { icon: '📅', text: 'Average shifts per week',        val: '4 days / week'                             },
  { icon: '🏖️', text: 'Annual holiday entitlement',    val: '122 hours per employee'                     },
  { icon: '📆', text: '1 week of leave',                val: '25 holiday hours'                          },
  { icon: '🗓️', text: 'Full weekend off',              val: '6 holiday hours'                           },
  { icon: '↔️', text: 'Weekly hours range',            val: '24h min – 36h max (avg 27h)'               },
  { icon: '📋', text: 'Holiday notice required',        val: '4 weeks in advance'                        },
  { icon: '👥', text: 'Simultaneous leave',             val: 'Not permitted without approval'            },
  { icon: '🔄', text: 'Holiday blocks',                 val: '1–2 weeks standard; longer needs approval' },
  { icon: '🔴', text: 'Sick leave — fit note required', val: 'After 7 consecutive calendar days'         },
  { icon: '📉', text: 'Annual quiet period',            val: '~1 month reduced hours (rotational)'       },
  { icon: '🏪', text: 'Weekend cover',                  val: 'Minimum 1 weekend day per week'            },
  { icon: '⚠️', text: 'Absence notification',          val: 'Before shift start, as early as possible'  },
  { icon: '📄', text: 'Holiday accrual (year 1)',       val: 'Must be accrued before taken'              },
]
