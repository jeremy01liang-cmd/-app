import { createBrowserRouter } from "react-router";
import { Home } from "./pages/Home";
import { Cards } from "./pages/Cards";
import { Tasks } from "./pages/Tasks";
import { Learning } from "./pages/Learning";
import { WordLearning } from "./pages/WordLearning";
import { OralMathRace } from "./pages/OralMathRace";
import { SpaceGame } from "./pages/SpaceGame";
import { Login } from "./pages/Login";
import { ParentPortal } from "./pages/ParentPortal";
import { Account } from "./pages/Account";
import { AccountSetup } from "./pages/AccountSetup";
import { RedirectIfAuthenticated, RequireAuth } from "./components/AuthGuards";

export const router = createBrowserRouter([
  { path: "/parent", Component: ParentPortal },
  {
    Component: RedirectIfAuthenticated,
    children: [{ path: "/login", Component: Login }],
  },
  {
    path: "/",
    Component: RequireAuth,
    children: [
      { path: "account/setup", Component: AccountSetup },
      { index: true, Component: Home },
      { path: "cards", Component: Cards },
      { path: "tasks", Component: Tasks },
      { path: "learning", Component: Learning },
      { path: "learning/words", Component: WordLearning },
      { path: "learning/oral-math-race", Component: OralMathRace },
      { path: "game", Component: SpaceGame },
      { path: "account", Component: Account },
    ],
  },
]);
