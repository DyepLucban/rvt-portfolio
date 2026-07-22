import { createBrowserRouter } from "react-router-dom";
import MainLayout from "@/layouts/MainLayout";
import Me from "@/pages/Me";
import Experience from "@/pages/Experience";
import Skills from "@/pages/Skills";
import Projects from "@/pages/Projects";
import NotFound from "@/pages/NotFound";

export const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      { index: true, element: <Me /> },
      { path: 'experience', element: <Experience /> },
      { path: 'skills', element: <Skills /> },
      { path: 'projects', element: <Projects /> },
      { path: '*', element: <NotFound /> },
    ],
  },
]);
