import { combineReducers } from '@reduxjs/toolkit'
import selectedMonthReducer from './monthSelector'
import currentProjectIdReducer from './currentProjectId'

const rootReducer = combineReducers({
  selectedMonth: selectedMonthReducer,
  currentProjectId: currentProjectIdReducer,
})

export default rootReducer
