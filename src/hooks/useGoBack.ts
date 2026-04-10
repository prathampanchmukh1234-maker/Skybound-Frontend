import { useNavigate } from 'react-router-dom';

export const useGoBack = (fallback = '/') => {
  const navigate = useNavigate();
  return () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate(fallback);
    }
  };
};
