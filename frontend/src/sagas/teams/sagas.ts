import {all, call, put, takeEvery} from 'redux-saga/effects';
import {
  createTeamRoutine, deleteTeamRoutine,
  loadCompanyUsersRoutine,
  loadCurrentTeamRoutine,
  loadTeamsRoutine, toggleUserCurrentTeamRoutine,
  updateTeamRoutine
} from './routines';
import apiClient from '../../helpers/apiClient';
import {toastr} from 'react-redux-toastr';
import {IGeneric} from "../../models/IGeneric";
import {IUserInfo} from "../../models/user/types";
import {ITeam, ITeamCreate, ITeamShort, ITeamUpdate, ITeamUserToggle} from "../../models/teams/ITeam";
import {history} from "../../helpers/history.helper";

function* loadTeams() {
  try {
    const res: IGeneric<ITeamShort[]> = yield call(apiClient.get, '/api/teams');
    yield put(loadTeamsRoutine.success(res.data.data));
  } catch (error) {
    yield put(loadTeamsRoutine.failure());
    toastr.error(error);
  }
}

function* loadCurrentTeam(action: any) {
  try {
    const res: IGeneric<ITeam> = yield call(apiClient.get, `/api/teams/${action.payload}`);
    yield put(loadCurrentTeamRoutine.success(res.data.data));
  } catch (error) {
    yield put(loadCurrentTeamRoutine.failure());
    toastr.error("Unable to load team");
    history.push("/teams");
  }
}

function* createTeam(action: any) {
  try {
    const team: ITeamCreate = action.payload;

    const response = yield call(apiClient.post, `http://localhost:5000/api/teams`, team);
    const data = response.data.data;
    yield put(createTeamRoutine.success(data));
    yield put(loadTeamsRoutine.trigger());
    history.replace(`/teams/${data.id}`);
    toastr.success("Team added");
  } catch (errorResponse) {
    yield put(createTeamRoutine.failure(errorResponse.data?.error || "No response"));
    toastr.error("Unable to create Team");
  }
}

function* updateTeam(action: any) {
  try {
    const team: ITeamUpdate = action.payload;

    yield call(apiClient.put, `http://localhost:5000/api/teams`, team);
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
    const id: string = action.payload;
    yield call(apiClient.delete, `http://localhost:5000/api/teams/${id}`);
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
    const response = yield call(apiClient.put, `http://localhost:5000/api/teams/toggle_user`, request);
    const data = response.data.data;
    yield put(toggleUserCurrentTeamRoutine.success(data));
    toastr.success(`User ${request.username} ${data.added ? "added to" : "deleted from"} the team`);
  } catch (errorResponse) {
    yield put(toggleUserCurrentTeamRoutine.failure(request.userId));
    toastr.error("Error while user toggle");
  }
}

function* loadCompanyUsers() {
  try{
    const res: IGeneric<IUserInfo> = yield call(apiClient.get, `http://localhost:5000/api/user/all/list`);
    yield put(loadCompanyUsersRoutine.success(res.data.data));
  } catch (e) {
    yield put(loadCompanyUsersRoutine.failure());
    toastr.error("Failed to load users");
  }
}

function* watchLoadTeams() {
  yield takeEvery(loadTeamsRoutine.TRIGGER, loadTeams);
}

function* watchLoadCurrentTeam() {
  yield takeEvery(loadCurrentTeamRoutine.TRIGGER, loadCurrentTeam);
}

function* watchCreateTeam() {
  yield takeEvery(createTeamRoutine.TRIGGER, createTeam);
}

function* watchUpdateTeam() {
  yield takeEvery(updateTeamRoutine.TRIGGER, updateTeam);
}

function* watchDeleteTeam() {
  yield takeEvery(deleteTeamRoutine.TRIGGER, deleteTeam);
}

function* watchToggleUserTeam() {
  yield takeEvery(toggleUserCurrentTeamRoutine.TRIGGER, toggleUserTeam);
}

function* watchLoadCompanyUsers() {
  yield takeEvery(loadCompanyUsersRoutine.TRIGGER, loadCompanyUsers);
}

export default function* teamsSaga() {
  yield all([
    watchLoadTeams(),
    watchLoadCurrentTeam(),
    watchCreateTeam(),
    watchUpdateTeam(),
    watchDeleteTeam(),
    watchToggleUserTeam(),
    watchLoadCompanyUsers()
  ]);
}
