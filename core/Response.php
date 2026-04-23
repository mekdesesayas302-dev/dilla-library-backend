<?php

class Response
{
    // Standard JSON response
    public static function json($data = [], $status = 200)
    {
        http_response_code($status);

        header("Content-Type: application/json");

        echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
        exit;
    }

    // Success response
    public static function success($message = "Success", $data = [], $status = 200)
    {
        self::json([
            "status" => "success",
            "message" => $message,
            "data" => $data
        ], $status);
    }

    // Error response
    public static function error($message = "Error", $status = 400, $errors = [])
    {
        self::json([
            "status" => "error",
            "message" => $message,
            "errors" => $errors
        ], $status);
    }

    // Validation error (422)
    public static function validation($errors = [])
    {
        self::json([
            "status" => "fail",
            "message" => "Validation failed",
            "errors" => $errors
        ], 422);
    }

    // Unauthorized (401)
    public static function unauthorized($message = "Unauthorized")
    {
        self::json([
            "status" => "error",
            "message" => $message
        ], 401);
    }

    // Forbidden (403)
    public static function forbidden($message = "Forbidden")
    {
        self::json([
            "status" => "error",
            "message" => $message
        ], 403);
    }

    // Not Found (404)
    public static function notFound($message = "Resource not found")
    {
        self::json([
            "status" => "error",
            "message" => $message
        ], 404);
    }

    // Server Error (500)
    public static function serverError($message = "Internal Server Error")
    {
        self::json([
            "status" => "error",
            "message" => $message
        ], 500);
    }

    // Custom response
    public static function custom($statusText, $message, $data = [], $statusCode = 200)
    {
        self::json([
            "status" => $statusText,
            "message" => $message,
            "data" => $data
        ], $statusCode);
    }
}