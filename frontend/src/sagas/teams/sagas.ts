import {all, call, put, takeEvery, select} from 'redux-saga/effects';
import {
  createTeamRoutine, deleteTeamRoutine,
  loadCompanyUsersRoutine, loadTeamRequestsRoutine,
  loadCurrentTeamRoutine,
  loadTeamsRoutine, toggleLeadCurrentTeamRoutine,
  toggleUserCurrentTeamRoutine,
  updateTeamRoutine
} from './routines';
import apiClient from '../../helpers/apiClient';
import {toastr} from 'react-redux-toastr';
import {IGeneric} from "../../models/IGeneric";
import {IUserInfo} from "../../models/user/types";
import {ITeam, ITeamLeadToggle, ITeamUserToggle} from "../../models/teams/ITeam";
import {history} from "../../helpers/history.helper";
import {IAppState} from "../../models/IAppState";
import {IRequestShort} from "../../models/report/IReport";

function* loadTeams(action: any) {
    try {
        const {query, notBlank} = action.payload || {};
        const store: IAppState = yield select();
        const {page, size} = store.teams.pagination;
        const api = query
            ? `/api/teams/search?page=${page}&size=${size}&query=${query}&${notBlank && 'notBlank=true'}`
            : `/api/teams?page=${page}&size=${size}&${notBlank && 'notBlank=true'}`;
        const res = yield call(apiClient.get, api);
        yield put(loadTeamsRoutine.success(res.data.data));
    } catch (error) {
        yield put(loadTeamsRoutine.failure());
        toastr.error(error.data?.error || 'No response');
    }
}

function* loadCurrentTeam(action: any) {
    try {
        const res: IGeneric<ITeam> = yield call(apiClient.get, `/api/teams/${action.payload}`);
        yield put(loadCurrentTeamRoutine.success(res.data.data));
    } catch (error) {
        yield put(loadCurrentTeamRoutine.failure());
        toastr.error("Unable to load team");
        history.push("/people/teams");
    }
}

function* loadTeamRequests(action: any) {
  try {
    const teamId: string = action.payload;
    const res: IGeneric<IRequestShort[]> = yield call(apiClient.get, `/api/request/team/${teamId}`);
    yield put(loadTeamRequestsRoutine.success(res.data.data));
  } catch (error) {
    yield put(loadTeamRequestsRoutine.failure());
    toastr.error("Unable to load requests");
  }
}

function* createTeam(action: any) {
    try {
        const response = yield call(apiClient.post, `/api/teams`, action.payload);
        const data = response.data.data;
        yield put(createTeamRoutine.success(data));
        yield put(loadTeamsRoutine.trigger());
        history.replace(`/people/teams/${data.id}`);
        toastr.success("Team added");
    } catch (errorResponse) {
        yield put(createTeamRoutine.failure(errorResponse.data?.error || "No response"));
        toastr.error("Team with entered name already exists");
    }
}

function* updateTeam(action: any) {
    try {
        yield call(apiClient.put, `/api/teams`, action.payload);
        yield put(updateTeamRoutine.success());
        yield put(loadTeamsRoutine.trigger());
        toastr.success("Team metadata updated");
    } catch (errorResponse) {
        yield put(updateTeamRoutine.failure(errorResponse.data?.error || "No response"));
        toastr.error("Unable to update Team metadata");
    }
}

function* deleteTeam(action: any) {
    try {
        yield call(apiClient.delete, `/api/teams/${action.payload}`);
        yield put(deleteTeamRoutine.success());
        yield put(loadTeamsRoutine.trigger());
        toastr.success("Team deleted");
    } catch (errorResponse) {
        yield put(updateTeamRoutine.failure());
        toastr.error(errorResponse.data?.error || "No response");
    }
}

function* toggleUserTeam(action: any) {
    const request: ITeamUserToggle = action.payload;
    try {
        const response = yield call(apiClient.put, `/api/teams/toggle_user`, request);
        const data = response.data.data;
        yield put(toggleUserCurrentTeamRoutine.success(data));

        const store: IAppState = yield select();
        const currentLeadId = store.teams?.current?.currentTeam?.teamLeadId;
        if (currentLeadId === request.userId && !data.added) {
            yield put(toggleLeadCurrentTeamRoutine.success({leadId: null}));
        }

        toastr.success(`User ${request.username} ${data.added ? "added to" : "deleted from"} the team`);
    } catch (errorResponse) {
        yield put(toggleUserCurrentTeamRoutine.failure(request.userId));
        toastr.error("Error while user toggle");
    }
}

function* toggleLeadTeam(action: any) {
    const request: ITeamLeadToggle = action.payload;
    try {
        const response = yield call(apiClient.put, `/api/teams/toggle_lead`, request);
        const data = response.data.data;
        yield put(toggleLeadCurrentTeamRoutine.success(data));
        toastr.success(`User ${request.username} ${data.leadId ? "is a new team lead" : "is not a team lead anymore"}`);
    } catch (error) {
        yield put(toggleLeadCurrentTeamRoutine.failure());
        toastr.error(error.response?.data?.error || "No response");
    }
}

function* loadCompanyUsers() {
    try {
        const res: IGeneric<IUserInfo> = yield call(apiClient.get, `/api/user/all/list`);
        yield put(loadCompanyUsersRoutine.success(res.data.data));
    } catch (e) {
        yield put(loadCompanyUsersRoutine.failure());
        toastr.error("Failed to load users");
    }
}

export default function* teamsSaga() {
  yield all([
    yield takeEvery(loadTeamsRoutine.TRIGGER, loadTeams),
    yield takeEvery(loadCurrentTeamRoutine.TRIGGER, loadCurrentTeam),
    yield takeEvery(loadTeamRequestsRoutine.TRIGGER, loadTeamRequests),
    yield takeEvery(createTeamRoutine.TRIGGER, createTeam),
    yield takeEvery(updateTeamRoutine.TRIGGER, updateTeam),
    yield takeEvery(deleteTeamRoutine.TRIGGER, deleteTeam),
    yield takeEvery(toggleUserCurrentTeamRoutine.TRIGGER, toggleUserTeam),
    yield takeEvery(toggleLeadCurrentTeamRoutine.TRIGGER, toggleLeadTeam),
    yield takeEvery(loadCompanyUsersRoutine.TRIGGER, loadCompanyUsers)
  ]);
}
