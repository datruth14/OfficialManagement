<?php

$_SESSION = [];
session_destroy();

jsonResponse(['message' => 'Logged out']);
