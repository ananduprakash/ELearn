import asyncHandler from "express-async-handler";
import { connection } from "../db/dbconnect.js";
import moment from "moment/moment.js";

export const createCourse = asyncHandler(async (req, res) => {
  const { courseName } = req.body;

  if (!courseName) {
    res.status(400);
    throw new Error("Please add all fields");
  }

  if (req.user.userRole != "teacher") {
    res.status(400);
    throw new Error("Unauthorized user");
  }

  const courseExists = await connection("courses")
    .select()
    .where("name", courseName)
    .first();

  if (courseExists) {
    res.status(400);
    throw new Error("Course already exists");
  }

  const courseCount = await connection("courses")
    .count()
    .where("teacher_id", req.user.id)
    .first();
  if (courseCount.count >= 3) {
    res.status(400);
    throw new Error("Course limit reached");
  }
  await connection("courses").insert({
    name: courseName,
    teacher_id: req.user.id,
  });

  let [course] = await connection("courses").select().where("name", courseName);

  if (course) {
    res.status(201).json({
      _id: course.id,
      name: course.name,
      teacher_id: course.teacher_id,
    });
  } else {
    res.status(400);
    throw new Error("Invalid user data");
  }
});

export const courseStudents = asyncHandler(async (req, res) => {
  const { courseName } = req.body;

  if (!courseName) {
    res.status(400);
    throw new Error("Please add all fields");
  }

  if (req.user.userRole != "student") {
    res.status(400);
    throw new Error("Unauthorized user");
  }

  const courseExists = await connection("courses")
    .select()
    .where("name", courseName)
    .first();

  if (!courseExists) {
    res.status(400);
    throw new Error("Invalid Course name");
  }

  const courseStudentsExists = await connection("course_students")
    .select()
    .where("course_id", courseExists.id)
    .where("student_id", req.user.id)
    .first();

  if (courseStudentsExists) {
    res.status(400);
    throw new Error("Already Enrolled");
  }

  let otherCourse = connection("course_students")
    .select("course_id")
    .where("student_id", req.user.id);
  // if (otherCourse) {
  //   otherCourse = otherCourse.map((id) => {
  //     return id.course_id;
  //   });
  let scheduleExists = await connection("schedule as s1")
    .select("s1.course_id")
    .join("schedule as s2", "s1.start_time", "=", "s2.start_time")
    .whereIn("s2.course_id", otherCourse)
    .whereNotIn("s1.course_id", otherCourse)
    .where("s1.course_id", courseExists.id);
  if (scheduleExists) {
    // scheduleExists = scheduleExists.map((id) => {
    //   return id.course_id;
    // });
    // if (scheduleExists.includes(courseExists.id)) {
    res.status(400);
    throw new Error("Overlapping schedules");
    // }
    // }
  }

  await connection("course_students").insert({
    course_id: courseExists.id,
    student_id: req.user.id,
  });

  const [schedule] = await connection("course_students")
    .select()
    .where("course_id", courseExists.id);

  if (schedule) {
    res.status(201).json({
      course_id: schedule.course_id,
      student_id: schedule.student_id,
    });
  } else {
    res.status(400);
    throw new Error("Invalid data");
  }
});

export const schedule = asyncHandler(async (req, res) => {
  const { courseName, date, startTime, endTime } = req.body;

  let year, month, day;

  if (!courseName || !date || !startTime || !endTime) {
    res.status(400);
    throw new Error("Please add all fields");
  }
  const start = moment(startTime, "HH:mm:ss");
  const end = moment(endTime, "HH:mm:ss");

  const diff = end.diff(start);

  if (diff != 3600000) {
    res.status(400);
    throw new Error("Wrong time period");
  }

  if (
    req.user.userRole != "admin" &&
    req.user.userRole != "manager" &&
    req.user.userRole != "teacher"
  ) {
    res.status(400);
    throw new Error("Unauthorized user");
  }

  const courseExists = await connection("courses")
    .select()
    .where("name", courseName)
    .first();

  if (!courseExists) {
    res.status(400);
    throw new Error("Invalid Course name");
  }
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (regex.test(date)) {
    [year, month, day] = date.split("-").map(Number);
    if (
      year < 0 ||
      year > 9999 ||
      month < 0 ||
      month > 12 ||
      day < 0 ||
      day > 31
    ) {
      res.status(400);
      throw new Error("Invalid date format");
    }
  } else {
    res.status(400);
    throw new Error("Invalid date format");
  }

  const course = await connection("courses")
    .select("id")
    .where("teacher_id", courseExists.teacher_id);

  const idCourse = course.map((id) => {
    return id.id;
  });

  const dayCheck = await connection("schedule")
    .count()
    .where("date", date)
    .whereIn("course_id", idCourse)
    .first();
  if (dayCheck.count >= 4) {
    res.status(400);
    throw new Error("Daily hour limit reached");
  }

  const weekCheck = await connection("schedule")
    .count()
    .whereBetween("date", [
      connection.raw("DATE(NOW() - INTERVAL '6 days')"),
      date,
    ])
    .whereIn("course_id", idCourse)
    .first();
  if (weekCheck.count >= 20) {
    res.status(400);
    throw new Error("Weekly hour limit reached");
  }

  const monthCheck = await connection("schedule")
    .count()
    .whereBetween("date", [
      connection.raw("DATE(NOW() - INTERVAL '1 month')"),
      date,
    ])
    .whereIn("course_id", idCourse)
    .first();
  if (monthCheck.count >= 50) {
    res.status(400);
    throw new Error("Monthly hour limit reached");
  }

  const scheduleCheck = await connection("schedule")
    .select()
    .where("date", date)
    .whereBetween("start_time", [startTime, endTime])
    .whereBetween("end_time", [startTime, endTime])
    .whereIn("course_id", idCourse)
    .first();

  if (scheduleCheck) {
    res.status(400);
    throw new Error("Overlapping another schedule");
  }

  await connection("schedule").insert({
    course_id: courseExists.id,
    date: date,
    start_time: startTime,
    end_time: endTime,
  });

  const [schedule] = await connection("schedule")
    .select()
    .where("start_time", startTime);

  if (schedule) {
    res.status(201).json({
      course_id: schedule.course_id,
      date: schedule.date,
      start_time: schedule.start_time,
      end_time: schedule.end_time,
    });
  } else {
    res.status(400);
    throw new Error("Invalid data");
  }
});
