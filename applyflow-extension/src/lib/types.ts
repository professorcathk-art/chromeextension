export type PersonalInfo = {
  first_name: string
  last_name: string
  email: string
  phone: string
  linkedin: string
  location: string
}

export type WorkExperience = {
  company: string
  title: string
  start_date: string
  end_date: string
  description: string
}

export type Education = {
  school: string
  degree: string
  field_of_study: string
  gpa: string
}

export type ResumeProfile = {
  personal_info: PersonalInfo
  work_experience: WorkExperience[]
  education: Education[]
  skills: string[]
  preferences: {
    target_titles: string[]
    min_salary: number
    open_to_recruiters: boolean
  }
}

export type SubscriptionStatus = "free" | "pro" | "cancelled"

export type FillFieldResult = {
  label: string
  filled: boolean
}

export type FillPageResult = {
  filled: FillFieldResult[]
  skipped: string[]
}

export const emptyResume = (): ResumeProfile => ({
  personal_info: {
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    linkedin: "",
    location: ""
  },
  work_experience: [],
  education: [],
  skills: [],
  preferences: {
    target_titles: [],
    min_salary: 0,
    open_to_recruiters: false
  }
})

export const FREE_FILL_LIMIT = 5
