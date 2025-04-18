import React from "react";

interface Props {
  children: React.ReactNode;
}

const Layout = ({ children }: Props) => {
  return (
    <main className="flex-center min-h-screen w-full bg-purple-100">
      {children}
    </main>
  );
};

export default Layout;
