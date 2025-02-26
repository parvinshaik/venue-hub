import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './components/App.jsx'
import Dashboard from './components/Dashboard.js'
import './index.css'
import NotFound from './components/PageNotFound.js'
import BookingForm from './components/BookingForm.js'
import BookingStatus from './components/BookingStatus.js'
import {BrowserRouter, Route, Routes} from 'react-router-dom'
import BookingDetailsPage from "./components/BookingDetailsPage.js";
import ApprovalsPage from './components/Approvals.js'
import Profile from './components/Profile.js'
import ChangePassword from './components/changePassword.js'


ReactDOM.createRoot(document.getElementById('root')).render(
    <BrowserRouter>
    <Routes>
          <Route path="/" element={<App/>} />
          <Route path="/dashboard" element={<Dashboard/>} />
          <Route path="/bookingform" element={<BookingForm/>} />
          <Route path="/bookingstatus" element={<BookingStatus/>} />
          <Route path="/approvals" element={<ApprovalsPage/>} />
          <Route path="/profile" element={<Profile/>} />
          <Route path="/booking/:bookingId" element={<BookingDetailsPage />} />
          <Route path="*" element={<NotFound />} />
          <Route path="changepassword" element={<ChangePassword />} />
          </Routes>
    </BrowserRouter>
)
