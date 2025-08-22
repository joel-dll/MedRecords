'use client';

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

