const Joi = require("@hapi/joi");

const db = require("../../models");
const encryptHelper = require("../../utils/encryptHelper");
const emails = require("../../utils/emails");
const crypto = require("../../utils/crypto");

const Users = db.User;
const UserPlan = db.UserPlan;
const Roles = db.Role;
const Project = db.Project;
const ProjectTask = db.ProjectTask;

exports.create = async (req, res) => {
	try {
		const joiSchema = Joi.object({
			projectName: Joi.string().required(),
			id: Joi.string().required(),
			keywords: Joi.string().required(),
			userId: Joi.string().required(),
			numberOfTasks: Joi.string().required(),
			projectStatus: Joi.string().optional().allow(null).allow(""),
			speech: Joi.string().optional().allow(null).allow(""),
			perspective: Joi.string().optional().allow(null).allow("")
		});
		const { error, value } = joiSchema.validate(req.body);

		if (error) {
			emails.errorEmail(req, error);

			const message = error.details[0].message.replace(/"/g, "");
			res.status(400).send({
				message: message
			});
		} else {
			const userExists = await Users.find({ _id: req.body.userId, isActive: "Y" }).populate("role");
			if (!userExists) {
				res.send({ message: "User Not Found" });
			} else {
				let projectObj = {
					projectName: req.body.projectName,
					keywords: req.body.keywords,
					user: req.body.userId,
					projectStatus: req.body.projectStatus,
					speech: req.body.speech ? req.body.speech : "",
					perspective: req.body.perspective ? req.body.perspective : ""
				};
				if (userExists.role.title == "Leads") {
					projectObj.numberOfTasks;

					Project.create(projectObj).then((response) => {
						// let projectTaskObj={
						// }
					});
				}
				const projectName = req.body.projectName;
				const id = req.body.id;
			}
		}
	} catch (err) {
		emails.errorEmail(req, err);
		res.status(500).send({
			message: err.message || "Some error occurred."
		});
	}
};

exports.detail = async (req, res) => {
	try {
		const joiSchema = Joi.object({
			userId: Joi.string().required()
		});
		const { error, value } = joiSchema.validate(req.body);

		if (error) {
			// emails.errorEmail(req, error);

			const message = error.details[0].message.replace(/"/g, "");
			res.status(400).send({
				message: message
			});
		} else {
			const userId = req.body.userId;

			Project.find({ user: userId })
				.then(async (response) => {
					// console.log(response);

					// Extract the project IDs from the response
					let projectIds = response.map((project) => project._id);
					let userPlan = await UserPlan.findOne({ user: userId }).populate({ path: "plan" });
					let project = [];

					console.log(userPlan);
					if (!userPlan.plan) {
						console.log("HI");
						let projectTask = await ProjectTask.find({ project: projectIds }).populate;
						console.log(projectTask);
					}

					for (const pro of response) {
						// Assuming `ProjectTask` has a field `project` that references `Project`'s _id
						const countTasks = await ProjectTask.countDocuments({ project: pro._id });

						let projectObj = {
							_id: pro._id,
							projectName: pro.projectName,
							keywords: pro.keywords,
							projectStatus: pro.projectStatus,
							createdAt: pro.createdAt,
							duration: pro.duration,
							texts: countTasks,
							numberOfTasks: pro.numberOfTasks,
							countTasks: countTasks // Add the count of tasks to the project object
						};

						project.push(projectObj);
					}

					res.send({ message: "List of the client projects", data: project });
				})
				.catch((err) => {
					res.status(500).send({
						message: err.message || "Some error occurred."
					});
				});
		}
	} catch (err) {
		// emails.errorEmail(req, err);
		res.status(500).send({
			message: err.message || "Some error occurred."
		});
	}
};
