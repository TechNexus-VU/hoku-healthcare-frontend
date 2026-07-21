const DashboardContainer = ({
    children,
    className = "",
  }) => {
    return (
      <div
        className={`
          mx-auto w-full
          max-w-[var(--dashboard-container)]
          px-4 py-5
          sm:px-6 sm:py-6
          lg:px-8 lg:py-8
          ${className}
        `}
      >
        {children}
      </div>
    );
  };
  
  export default DashboardContainer;