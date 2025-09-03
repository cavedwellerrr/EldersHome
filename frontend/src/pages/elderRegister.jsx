import { useEffect, useState, useContext } from 'react';
import ElderRegistrationForm from '../components/Forms/ElderRegistrationForm';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const ElderRegisterPage = () => {
  const { auth, loading } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !auth) {
      alert('Please log in as a guardian first');
      navigate('/login');
    }
  }, [auth, loading, navigate]);

  if (loading || !auth) return <p>Loading...</p>;

  return (
    <div>
      <ElderRegistrationForm />
    </div>
  );
};

export default ElderRegisterPage;
