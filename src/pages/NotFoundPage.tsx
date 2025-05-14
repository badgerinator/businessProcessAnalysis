import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';

const NotFoundPage: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <h1 className="text-5xl font-bold mb-4">404</h1>
      <p className="text-xl mb-8">Sayfa bulunamadı</p>
      <Link to="/">
        <Button variant="primary">Ana Sayfaya Dön</Button>
      </Link>
    </div>
  );
};

export default NotFoundPage;