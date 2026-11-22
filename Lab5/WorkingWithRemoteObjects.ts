import type { Express, Request, Response } from "express";

const assignment = {
  id: 1,
  title: "NodeJS Assignment",
  description: "Create a NodeJS server with ExpressJS",
  due: "2021-10-10",
  completed: false,
  score: 0,
};

const moduleObject = {
  id: "1",
  name: "Introduction to Node.js",
  description: "Learn Express HTTP routes",
  course: "CS5610",
};

export default function WorkingWithRemoteObjects(app: Express) {
  const getAssignment = (req: Request, res: Response) => {
    res.json(assignment);
  };

  app.get("/lab5/assignment", getAssignment);

  const getAssignmentTitle = (req: Request, res: Response) => {
    res.send(assignment.title);
  };

  app.get("/lab5/assignment/title", getAssignmentTitle);

  app.get("/lab5/assignment/title/:newTitle", (req, res) => {
    assignment.title = req.params.newTitle;
    res.json(assignment);
  });

  app.get("/lab5/assignment/score/:newScore", (req, res) => {
    const score = Number(req.params.newScore);
    if (!req.params.newScore.trim() || !Number.isFinite(score)) {
      res.status(400).send("Score must be a finite number");
      return;
    }
    assignment.score = score;
    res.json(assignment);
  });

  app.get("/lab5/assignment/completed/:newCompleted", (req, res) => {
    const { newCompleted } = req.params;
    if (newCompleted !== "true" && newCompleted !== "false") {
      res.status(400).send("Completed must be true or false");
      return;
    }
    assignment.completed = newCompleted === "true";
    res.json(assignment);
  });

  app.get("/lab5/module", (req, res) => {
    res.json(moduleObject);
  });

  app.get("/lab5/module/name", (req, res) => {
    res.json(moduleObject.name);
  });

  app.get("/lab5/module/name/:newName", (req, res) => {
    moduleObject.name = req.params.newName;
    res.json(moduleObject);
  });

  app.get("/lab5/module/description/:newDescription", (req, res) => {
    moduleObject.description = req.params.newDescription;
    res.json(moduleObject);
  });
}
