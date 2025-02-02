const Joi = require("@hapi/joi");

const db = require("../../models");
const encryptHelper = require("../../utils/encryptHelper");
const emails = require("../../utils/emails");
const crypto = require("../../utils/crypto");

const Users = db.User;
const Roles = db.Role;
const ProjectTask = db.ProjectTask;
const Project = db.Project;

exports.detail = async (req, res) => {
	try {
		const joiSchema = Joi.object({
			projectId: Joi.string().required()
		});
		const { error, value } = joiSchema.validate(req.body);

		if (error) {
			// emails.errorEmail(req, error);

			const message = error.details[0].message.replace(/"/g, "");
			res.status(400).send({
				message: message
			});
		} else {
			const projectId = req.body.projectId;

			ProjectTask.find({ project: projectId })
				.select("-assignedLector -assignedTexter -comments")
				.then((response) => {
					res.send({ message: "Detail of the project task", data: response });
				});
		}
	} catch (err) {
		// emails.errorEmail(req, err);
		res.status(500).send({
			message: err.message || "Some error occurred."
		});
	}
};

exports.projectTaskUpdate = async (req, res) => {
	try {
		const joiSchema = Joi.object({
			projectId: Joi.string().required(),
			projectTaskId: Joi.string().required()
		});

		const { error, value } = joiSchema.validate(req.body);

		if (error) {
			const message = error.details[0].message.replace(/"/g, "");
			res.status(400).send({
				message: message
			});
		} else {
			const projectId = req.body.projectId;
			const projectTaskId = req.body.projectTaskId;

			const project = await Project.findOne({ _id: projectId });

			if (!project) {
				res.status(401).send({
					message: "Project not Found"
				});
			}

			const projectTask = await ProjectTask.findOne({ _id: projectTaskId, project: projectId });

			if (!projectTask) {
				res.status(401).send({
					message: "Task not found."
				});
			}

			const reverse = !projectTask.published;

			const projectTaskUpdate = await ProjectTask.findOneAndUpdate(
				{ _id: projectTaskId },
				{ published: reverse },
				{ new: true }
			);

			if (projectTaskUpdate) {
				res.send({
					message: "ProjectTask updated successfully.",
					data: projectTaskUpdate
				});
			} else {
				res.status(500).send({
					message: "Failed to update projectTask."
				});
			}
		}
	} catch (err) {
		res.status(500).send({
			message: err.message || "Some error occurred."
		});
	}
};
