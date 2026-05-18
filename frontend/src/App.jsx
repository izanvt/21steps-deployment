import "./App.css";
import { Routes, Route, Outlet, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

// layouts
import MainLayout from "./components/MainLayout";

// auth 
import AuthPage from "./auth/AuthPage";

// páginas públicas 
import LandingPage from "./components/LandingPage";
import PublicProfile from "./components/PublicProfile";

// páginas protegidas 
import Dashboard from "./components/Dashboard";
import About from "./components/About";
import Contact from "./components/Contact";
import Profile from "./components/Profile";
import Badges from "./components/Badges";
import Friends from "./components/Friends";
import AdminPanel from "./components/AdminPanel";
import Journal from "./components/Journal";

// routines 
import Routines from "./routines/ListRoutines";
import Routine from "./routines/Routine";
import CreateRoutine from "./routines/CreateRoutine";
import EditRoutine from "./routines/EditRoutine";

// events
import DayView from "./events/DayView";
import Event from "./events/Event";

// errors
import Forbidden from "./components/NotFound404";

export const RequireAuth = () => {
    const token = useSelector((state) => state.auth.token);

    return token ? <Outlet /> : <Navigate to="/auth" replace />;
};

function App() {
    return (
        <Routes>

            {/* rutas públicas */}
            <Route path="/landing" element={<LandingPage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/u/:share_token" element={<PublicProfile />} />

            {/* rutas protegidas */}
            <Route element={<RequireAuth />}>
                <Route element={<MainLayout />}>

                    <Route path="/" element={<Dashboard />} />

                    {/* rutinas */}
                    <Route path="/routines" element={<Routines />} />
                    <Route path="/routines/new" element={<CreateRoutine />} />
                    <Route path="/routines/:id" element={<Routine />} />
                    <Route path="/routines/:id/edit" element={<EditRoutine />} />

                    {/* eventos */}
                    <Route path="/day/:date" element={<DayView />} />
                    <Route path="/events/:id" element={<Event />} />

                    {/* general */}
                    <Route path="/about" element={<About />} />
                    <Route path="/contact" element={<Contact />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/badges" element={<Badges />} />
                    <Route path="/friends" element={<Friends />} />
                    <Route path="/journal" element={<Journal />} />

                    {/* admin */}
                    <Route path="/admin" element={<AdminPanel />} />
                </Route>
            </Route>

            {/* 404 */}
            <Route path="*" element={<Forbidden />} />
        </Routes>
    );
}

export default App;