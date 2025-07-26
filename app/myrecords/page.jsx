'use client';
import DashboardHeader from '../components/Header';
import Footer from '../components/Footer';
import GreetingCard from '../components/GreetingCard';
import FileUpload from '../components/FileUpload';
import RecordsGrid from '../components/RecordsGrid';


export default function MyRecords() {
  return (
    <div className="dashboard-container">
       <FileUpload />
       <RecordsGrid />
    </div>
  );
}

