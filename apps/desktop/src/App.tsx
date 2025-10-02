import { Route, Routes } from "react-router-dom"
import Home from "./pages/Home"
import { PartDetailPage } from "./pages/PartDetailPage"

export const App = () => {
    return (
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/parts/:id" element={<PartDetailPage />} />
        </Routes>
    )
}