export const useAuth = () => {
  const email = localStorage.getItem('userEmail');
  const isLoggedIn = !!email;
  const name = localStorage.getItem('userName');
  return {
    email,
    isLoggedIn,
    name
  };
};
