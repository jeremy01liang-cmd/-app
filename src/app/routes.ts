import { createBrowserRouter } from "react-router";
import { Home } from "./pages/Home";
import { Cards } from "./pages/Cards";
import { Tasks } from "./pages/Tasks";
import { Learning } from "./pages/Learning";
import { WordLearning } from "./pages/WordLearning";
import { SpaceGame } from "./pages/SpaceGame";

export const router = createBrowserRouter([
  {
    path: "/",
    children: [
      { index: true, Component: Home },
      { path: "cards", Component: Cards },
      { path: "tasks", Component: Tasks },
      { path: "learning", Component: Learning },
      { path: "learning/words", Component: WordLearning },
      { path: "game", Component: SpaceGame },
    ],
  },
]);
