# -*- coding: utf-8 -*-
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#    http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or
# implied.
# See the License for the specific language governing permissions and
# limitations under the License.
"""Fixtures for API V1."""


import flask.testing
import pytest

import decapod_api
from decapod_common.models import user


class JsonApiClient(flask.testing.FlaskClient):

    AUTH_URL = None
    LOGIN = None
    PASSWORD = None

    def __init__(self, *args, **kwargs):
        super(JsonApiClient, self).__init__(*args, **kwargs)
        self.auth_token = None

    def login(self, login=None, password=None):
        login = login or self.LOGIN
        password = password or self.PASSWORD
        response = self.post(
            self.AUTH_URL, data={"username": login, "password": password})

        if 200 <= response.status_code < 299:
            self.auth_token = response.json["id"]

        return response

    def logout(self, login=None, password=None):
        response = self.delete(self.AUTH_URL)

        if 200 <= response.status_code < 299:
            self.auth_token = None

        return response

    def open(self, *args, **kwargs):
        data = kwargs.get("data")
        if data is not None and not kwargs.get("content_type"):
            kwargs["data"] = flask.json.dumps(data)
            kwargs["content_type"] = "application/json"
            kwargs.setdefault("headers", {})["Accept"] = "application/json"
        if data is None and kwargs.get("content_type"):
            kwargs["content_type"] = kwargs["content_type"]
            kwargs.setdefault("headers", {})["Accept"] = kwargs["content_type"]

        if self.auth_token:
            self.install_token(kwargs)

        return super(JsonApiClient, self).open(*args, **kwargs)

    def install_token(self, kwargs):
        headers = dict(kwargs.pop("headers", []))
        headers["Authorization"] = self.auth_token

        kwargs["headers"] = sorted(headers.items())


@pytest.yield_fixture
def app(configure_model):
    application = decapod_api.create_application()
    application.testing = True
    application.test_client_class = JsonApiClient

    with application.app_context():
        yield application


@pytest.fixture
def client_v1(client):
    client.AUTH_URL = "/v1/auth/"

    return client


@pytest.yield_fixture
def sudo_client_v1(app, sudo_user):
    with app.test_client() as client:
        client.AUTH_URL = "/v1/auth/"
        client.login("sudo", "sudo")

        yield client


@pytest.fixture
def normal_user(sudo_user):
    return user.UserModel.make_user(
        pytest.faux.gen_alphanumeric(),
        "qwerty",
        pytest.faux.gen_email(domain="example.com"),
        pytest.faux.gen_uuid(),
        [],
        initiator_id=sudo_user.model_id
    )
