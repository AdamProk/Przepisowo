<?php

namespace App\Controller;

use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Doctrine\ORM\EntityManagerInterface;
use App\Entity\Recipes;
use App\Repository\RecipesRepository;
use Symfony\Flex\Recipe;

class HomeController extends AbstractController
{
    private $entityManager;
    public function __construct(EntityManagerInterface $entityManager)
    {
        $this->entityManager = $entityManager;
    }

    #[Route('/', name: 'app_home', methods: ["GET"])]
    public function getRecipes(): JsonResponse
    {
        $recipes = $this->entityManager->getRepository(Recipes::class)->findAll();
        $recipe = [];
        $totalScore = 0;
        $commentsCount = 0;
        $overallScore = 0;
        foreach ($recipes as $recipe) {
            foreach ($recipe->getComments() as $comment){
                $totalScore += $comment->getRating();
                $commentsCount++;
            }

            if($commentsCount!=0) $overallScore = $totalScore/$commentsCount;
            $recipe[] = [
                'id' => $recipe->getId(),
                'name' => $recipe->getRecipeName(),
                'score' => $overallScore,
                'time' => $recipe->getPrepTime(),
                'amount' => $recipe->getAmount(),
                'image' => $recipe->getRecipePicture()
            ];
        }
        usort($recipe, function($a, $b) {
            return $b['id'] <=> $a['id'];
        });

        return new JsonResponse($recipe);
    }
}
