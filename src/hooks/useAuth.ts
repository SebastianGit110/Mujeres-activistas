export const useAuth = () => {
  const email = localStorage.getItem('userEmail');
  const isLoggedIn = !!email;

  return {
    email,
    isLoggedIn,
  };
};
