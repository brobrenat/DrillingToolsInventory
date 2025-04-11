export const checkPermission = (requiredPermission) => {
  const userRole = localStorage.getItem('userRole');
  
  // Define permissions for different roles
  const permissions = {
    admin: ['view', 'add', 'edit', 'delete', 'terminate'],
    supervisor: ['view'],
    // Add other roles as needed
  };

  // Check if user has permission
  return permissions[userRole]?.includes(requiredPermission) || false;
};

export const isAdmin = () => localStorage.getItem('userRole') === 'Admin';
export const isSupervisor = () => localStorage.getItem('userRole') === 'Supervisor';
