<?php

namespace App\Controller;

use App\Service\RecipeRecommendationService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Core\User\UserInterface;
use Symfony\Bundle\SecurityBundle\Security;

#[Route('/api/recommendations')]
class RecipeRecommendationController extends AbstractController
{
    public function __construct(
        private RecipeRecommendationService $recommendationService,
        private Security $security
    ) {}

    #[Route('/personalized', name: 'get_personalized_recommendations', methods: ['GET'])]
    public function getPersonalizedRecommendations(): JsonResponse
    {
        $user = $this->security->getUser();
        if (!$user) {
            return $this->json(['error' => 'User not authenticated'], 401);
        }
        
        $recommendations = $this->recommendationService->getPersonalizedRecommendations($user);
        
        // Transform recommendations to avoid circular references
        $transformedRecommendations = array_map(function($rec) {
            $recipe = $rec['recipe'];
            return [
                'recipe' => [
                    'id' => $recipe->getId(),
                    'name' => $recipe->getRecipeName(),
                    'description' => $recipe->getDescription(),
                    'picture' => $recipe->getRecipePicture(),
                    'recipePicture' => $recipe->getRecipePicture(),
                    'image' => $recipe->getRecipePicture(),
                    'prepTime' => $recipe->getPrepTime(),
                    'amount' => $recipe->getAmount(),
                    'cuisines' => array_map(function($cuisine) {
                        return $cuisine->getCuisine();
                    }, $recipe->getRecipeCuisine()->toArray()),
                    'nutrients' => $recipe->getNutrients() ? [
                        'calories' => $recipe->getNutrients()->getCalories(),
                        'proteins' => $recipe->getNutrients()->getProteins(),
                        'carbohydrates' => $recipe->getNutrients()->getCarbohydrates(),
                        'fats' => $recipe->getNutrients()->getFats()
                    ] : null
                ],
                'matchScore' => $rec['matchScore'],
                'reason' => $rec['reason']
            ];
        }, $recommendations);
        
        $response = $this->json($transformedRecommendations);
        $response->headers->set('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
        $response->headers->set('Pragma', 'no-cache');
        $response->headers->set('Expires', 'Sat, 01 Jan 2000 00:00:00 GMT');
        
        return $response;
    }

    #[Route('/cuisine-based', name: 'get_cuisine_based_recommendations', methods: ['GET'])]
    public function getCuisineBasedRecommendations(): JsonResponse
    {
        $user = $this->security->getUser();
        if (!$user) {
            return $this->json(['error' => 'User not authenticated'], 401);
        }
        
        $recommendations = $this->recommendationService->getCuisineBasedRecommendations($user);
        
        // Transform recommendations to avoid circular references
        $transformedRecommendations = array_map(function($rec) {
            $recipe = $rec['recipe'];
            return [
                'recipe' => [
                    'id' => $recipe->getId(),
                    'name' => $recipe->getRecipeName(),
                    'description' => $recipe->getDescription(),
                    'picture' => $recipe->getRecipePicture(),
                    'prepTime' => $recipe->getPrepTime(),
                    'amount' => $recipe->getAmount(),
                    'cuisines' => array_map(function($cuisine) {
                        return $cuisine->getCuisine();
                    }, $recipe->getRecipeCuisine()->toArray()),
                    'nutrients' => $recipe->getNutrients() ? [
                        'calories' => $recipe->getNutrients()->getCalories(),
                        'proteins' => $recipe->getNutrients()->getProteins(),
                        'carbohydrates' => $recipe->getNutrients()->getCarbohydrates(),
                        'fats' => $recipe->getNutrients()->getFats()
                    ] : null
                ],
                'matchScore' => $rec['matchScore'],
                'reason' => $rec['reason']
            ];
        }, $recommendations);
        
        $response = $this->json($transformedRecommendations);
        $response->headers->set('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
        $response->headers->set('Pragma', 'no-cache');
        $response->headers->set('Expires', 'Sat, 01 Jan 2000 00:00:00 GMT');
        
        return $response;
    }

    #[Route('/nutritional', name: 'get_nutritional_recommendations', methods: ['GET'])]
    public function getNutritionalRecommendations(): JsonResponse
    {
        $user = $this->security->getUser();
        if (!$user) {
            return $this->json(['error' => 'User not authenticated'], 401);
        }
        
        $recommendations = $this->recommendationService->getNutritionalRecommendations($user);
        
        // Transform recommendations to avoid circular references
        $transformedRecommendations = array_map(function($rec) {
            $recipe = $rec['recipe'];
            return [
                'recipe' => [
                    'id' => $recipe->getId(),
                    'name' => $recipe->getRecipeName(),
                    'description' => $recipe->getDescription(),
                    'picture' => $recipe->getRecipePicture(),
                    'prepTime' => $recipe->getPrepTime(),
                    'amount' => $recipe->getAmount(),
                    'cuisines' => array_map(function($cuisine) {
                        return $cuisine->getCuisine();
                    }, $recipe->getRecipeCuisine()->toArray()),
                    'nutrients' => $recipe->getNutrients() ? [
                        'calories' => $recipe->getNutrients()->getCalories(),
                        'proteins' => $recipe->getNutrients()->getProteins(),
                        'carbohydrates' => $recipe->getNutrients()->getCarbohydrates(),
                        'fats' => $recipe->getNutrients()->getFats()
                    ] : null
                ],
                'matchScore' => $rec['matchScore'],
                'reason' => $rec['reason']
            ];
        }, $recommendations);
        
        $response = $this->json($transformedRecommendations);
        $response->headers->set('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
        $response->headers->set('Pragma', 'no-cache');
        $response->headers->set('Expires', 'Sat, 01 Jan 2000 00:00:00 GMT');
        
        return $response;
    }
} 