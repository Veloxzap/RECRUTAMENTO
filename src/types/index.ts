export type CurrentStatus = 'Sim' | 'Não'
export type TestResult = 'Aprovado' | 'Reprovado' | 'Aguardando'
export type JobStatus = 'disponível' | 'preenchida'

export interface WorkLocation {
  id: string
  name: string
  address: string | null
  city: string | null
  state: string | null
  notes: string | null
  created_at: string
}

export interface TestLocation {
  id: string
  name: string
  address: string | null
  city: string | null
  state: string | null
  capacity: number | null
  responsible: string | null
  notes: string | null
  created_at: string
}

export interface JobPosition {
  id: string
  title: string
  status: JobStatus
  created_at: string
}

export interface Candidate {
  id: string
  name: string
  contact: string
  job_position: string
  work_location_id: string | null
  test_location_id: string | null
  test_date: string | null
  current_status: CurrentStatus
  test_result: TestResult
  should_hire: boolean
  notes: string | null
  created_at: string
  updated_at: string
  
  // Relations
  work_location?: WorkLocation
  test_location?: TestLocation
}
export interface Vacancy {
  id: string
  title: string
  period: 'Plantão Noturno' | 'Plantão Diurno' | 'Diarista'
  status: 'Confirmado' | 'Outros'
  quantity: number
  status_reason: string | null
  created_at: string
}
