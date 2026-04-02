import { BrowserRouter, Routes, Route } from 'react-router-dom';
import CustomCursor from './components/CustomCursor';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import ResultPage from './pages/ResultPage';
import AnalysePage from './pages/AnalysePage';
import './App.css';

export default function App() {
  return (
    <BrowserRouter>
      <CustomCursor />
      <Routes>
        <Route path="/" element={
          <>
            <Navbar />
            <HomePage />
          </>
        } />
        <Route path="/result" element={<ResultPage />} />
        <Route path="/analyse" element={<AnalysePage />} />
      </Routes>
    </BrowserRouter>
  );
}
