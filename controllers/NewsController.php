<?php
require_once __DIR__ . '/../models/News.php';
require_once __DIR__ . '/../core/Response.php';

class NewsController {
    private $news;

    public function __construct() {
        $this->news = new News();
    }

    public function index() {
        Response::json($this->news->getAll());
    }

    public function show($id) {
        $newsItem = $this->news->getById($id);
        $newsItem ? Response::json($newsItem) : Response::json(['error' => 'News not found'], 404);
    }

    public function store($data) {
        $this->news->create($data['title'], $data['content'], $data['author'])
            ? Response::json(['message' => 'News created successfully'])
            : Response::json(['error' => 'Failed to create news'], 500);
    }

    public function updateNews($id, $data) {
        $this->news->update($id, $data['title'], $data['content'], $data['author'])
            ? Response::json(['message' => 'News updated successfully'])
            : Response::json(['error' => 'Failed to update news'], 500);
    }

    public function deleteNews($id) {
        $this->news->delete($id)
            ? Response::json(['message' => 'News deleted successfully'])
            : Response::json(['error' => 'Failed to delete news'], 500);
    }
}