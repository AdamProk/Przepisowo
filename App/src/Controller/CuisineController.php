<?php

namespace App\Controller;

use App\Repository\CuisineRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;

#[Route('/api')]
class CuisineController extends AbstractController
{
    public function __construct(
        private CuisineRepository $cuisineRepository
    ) {}

    #[Route('/cuisines', name: 'get_cuisines', methods: ['GET'])]
    public function getCuisines(): JsonResponse
    {
        $cuisines = $this->cuisineRepository->findAll();
        
        $cuisineData = array_map(function($cuisine) {
            return [
                'id' => $cuisine->getId(),
                'cuisine' => $cuisine->getCuisine()
            ];
        }, $cuisines);

        return $this->json($cuisineData);
    }
} 