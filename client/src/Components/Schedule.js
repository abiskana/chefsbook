import React from "react";
import moment from "moment";
import { connect } from "react-redux";
import Icons from "../img/sprite.svg";
import ScheduleAdd from "./ScheduleAdd";
import { openWindowAction } from "../actions";
import { openMemberAction } from "../actions";
import Member from "./Member";

class Schedule extends React.Component {
	state = {
		dateContext: moment(),
		schedule: [],
		popup: "none",
		member: "",
		displayMember: "none",
		scheduleMember: []
	};

	componentWillMount() {
		fetch("/api/schedule", { credentials: "include" })
			.then(data => data.json())
			.then(sch => {
				const schedule = this.checkWeek(sch);
				this.setState({ schedule: schedule });
			})
			.catch(err => console.log(err));
	}

	checkWeek = schedule => {
		let selected = [];
		schedule.map(each => {
			if (each.week === this.state.dateContext.week()) {
				selected = each.data;
			}
			if (each.week === 0 && selected.length < 1) {
				selected = each.data;
			}
			return null
		});
		return selected;
	};
	changeWeek = async a => {
		const currentWeek = this.state.dateContext.week();
		await this.setState({
			dateContext: moment(moment().week(currentWeek + a))
		});

		fetch("/api/schedule", { credentials: "include" })
			.then(data => data.json())
			.then(sch => {
				const schedule = this.checkWeek(sch);
				this.setState({ schedule: schedule });
			})
			.catch(err => console.log(err));
	};

	member = (name) => {
		this.props.openMemberAction();
		this.setState({
			member: name
		});

		if (name) {
			const nameObj = { name: name, week: this.state.dateContext.week() };
			
			fetch("/api/member_fetch", {
				method: "POST",
				credentials: "include",
				headers: {
					"Content-type": "application/json"
				},
				body: JSON.stringify(nameObj)
			})
				.then(data => data.json())
				.then(res =>
					this.setState({
						scheduleMember: res
					})
				)
				.catch(err => console.log(err));
		}
	};

	render() {
		const { dateContext, schedule } = this.state;
		const currentWeek = dateContext.week();
		const weekdaysShort = moment.weekdaysShort();

		let startOfWeek = moment(dateContext).startOf("week");
		let endOfWeek = moment(dateContext).endOf("week");
		let days = [];
		let day = startOfWeek;

		while (day <= endOfWeek) {
			days.push(day.date());
			day = day.clone().add(1, "d");
		}

		return (
			<div className="schedule">
				
				<svg className="schedule__icon">
					<use xlinkHref={`${Icons}#icon-assignment`} />
				</svg>
				<h2 className="schedule__weekNumber">
					This is week nr. {currentWeek}
				</h2>
				<div className="schedule__buttons">
					<div
						className="schedule__buttons--btn"
						onClick={() => this.changeWeek(-1)}
					>
						&#60; Prev week
					</div>
					<div
						className="schedule__buttons--btn"
						onClick={() => this.changeWeek(1)}
					>
						Next week &#62;
					</div>
				</div>
				<div className="schedule__head">
					<div className="schedule__head--name">Name</div>
					{weekdaysShort.map((day, i) => {
						let dn = days[i];
						let th = "th";
						if (dn === 1) {
							th = "st";
						} else if (dn === 2) {
							th = "nd";
						}
						return (
							<div
								className="schedule__head--day"
								key={`@#$${i * 7.213}`}
							>
								<p>{day}</p>
								<p>
									{dn} <sup>{th}</sup>
								</p>
							</div>
						);
					})}
				</div>
				{schedule.map((each, i) => {
					return (
						<div key={i * 0.249} className="schedule__graph">
							<div
								className="schedule__graph--name"
								onClick={() => this.member(each.name)}
							>
								<svg className="schedule__icon--2">
									<use xlinkHref={`${Icons}#icon-user-tie`} />
								</svg>
								{each.name}
							</div>
							{each.days.map((day, i) => {
								return (
									<div
										className="schedule__graph--day"
										key={`!#$${i * 3.332}`}
									>
										{day}
									</div>
								);
							})}
						</div>
					);
				})}

				<div className="schedule__options">
					<button
						className="schedule__options__btn"
						onClick={() => {
							this.props.openWindowAction();
						}}
					>
						Add a team member
					</button>
				</div>

				<ScheduleAdd popup={this.state.popup} />
				<Member
					member={this.state.member}
					displayMember={this.state.displayMember}
					scheduleMember={this.state.scheduleMember}
					week={currentWeek}
				/>
			</div>
		);
	}
}

const mapStateToProps = state => ({
	addMember: state.addMember.display,
	openMember: state.openMember.displayMember
});
export default connect(
	mapStateToProps,
	{ openWindowAction, openMemberAction }
)(Schedule);
