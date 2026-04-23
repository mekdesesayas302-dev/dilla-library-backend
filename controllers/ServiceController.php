<?php
require_once __DIR__ . '/../models/Service.php';
require_once __DIR__ . '/../core/Response.php';

class ServiceController {
    private $service;

    public function __construct() {
        $this->service = new Service();
    }

    public function index() {
        Response::json($this->service->getAll());
    }

    public function show($id) {
        $service = $this->service->getById($id);
        $service ? Response::json($service) : Response::json(['error' => 'Service not found'], 404);
    }

    public function store($data) {
        $this->service->create($data['name'], $data['description'], $data['icon'])
            ? Response::json(['message' => 'Service created successfully'])
            : Response::json(['error' => 'Failed to create service'], 500);
    }

    public function updateService($id, $data) {
        $this->service->update($id, $data['name'], $data['description'], $data['icon'])
            ? Response::json(['message' => 'Service updated successfully'])
            : Response::json(['error' => 'Failed to update service'], 500);
    }

    public function deleteService($id) {
        $this->service->delete($id)
            ? Response::json(['message' => 'Service deleted successfully'])
            : Response::json(['error' => 'Failed to delete service'], 500);
    }
}