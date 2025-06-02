<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\BinaryFileResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Symfony\Component\Routing\Annotation\Route;

class FileController extends AbstractController
{
    #[Route('/uploads/{type}/{filename}', name: 'serve_file')]
    public function serveFile(string $type, string $filename): Response
    {
        $uploadDir = $this->getParameter('kernel.project_dir') . '/public/uploads/' . $type;
        $filePath = $uploadDir . '/' . $filename;

        if (!file_exists($filePath)) {
            // Return default image based on type
            $defaultImage = match ($type) {
                'profile_pictures' => $this->getParameter('kernel.project_dir') . '/public/img/default/sample.png',
                'recipe_images' => $this->getParameter('kernel.project_dir') . '/public/img/default/kotlet.jpg',
                default => $this->getParameter('kernel.project_dir') . '/public/img/default/sample.png',
            };

            if (!file_exists($defaultImage)) {
                throw new NotFoundHttpException('Default image not found');
            }
            return new BinaryFileResponse($defaultImage);
        }

        $response = new BinaryFileResponse($filePath);
        $response->headers->set('Access-Control-Allow-Origin', '*');
        return $response;
    }
} 