/**
 * ShadowMe - Your AI Cognitive Twin
 * Main App Component with Routing
 */
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { EventTrackerProvider } from './context/EventTrackerContext';
import { ProtectedRoute, PublicRoute } from './components/ProtectedRoute';
import { Login } from './pages/Login';
import { Onboarding } from './pages/Onboarding';
import { Dashboard } from './pages/Dashboard';

function App() {
    return (
        <AuthProvider>
            <EventTrackerProvider>
                <BrowserRouter>
                    <Routes>
                    {/* Public route - Login/Signup */}
                    <Route 
                        path="/" 
                        element={
                            <PublicRoute>
                                <Login />
                            </PublicRoute>
                        } 
                    />
                    
                    {/* Protected routes */}
                    <Route 
                        path="/onboarding" 
                        element={
                            <ProtectedRoute>
                                <Onboarding />
                            </ProtectedRoute>
                        } 
                    />
                    
                    <Route 
                        path="/dashboard" 
                        element={
                            <ProtectedRoute>
                                <Dashboard />
                            </ProtectedRoute>
                        } 
                    />
                    
                        {/* Catch-all redirect to home */}
                        <Route path="*" element={<Login />} />
                    </Routes>
                </BrowserRouter>
            </EventTrackerProvider>
        </AuthProvider>
    );
}

export default App;
