<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;
use App\Entity\Recipes;
use App\Entity\Comments;
use App\Entity\Cuisine;
use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use DateTime;

class RecipeController extends AbstractController
{
    private $entityManager;
    public function __construct(EntityManagerInterface $entityManager)
    {
        $this->entityManager = $entityManager;
    }

    #[Route('/api/recipes/all', name: 'app_recipe', methods: ["GET"])]
    public function getRecipe(): JsonResponse
    {
        $recipes = $this->entityManager->getRepository(Recipes::class)->findAll();
        $recipesData = [];
        foreach ($recipes as $recipe) {
            $totalScore = 0;
            $commentsCount = 0;
            $overallScore = 0;

            foreach ($recipe->getComments() as $comment){
                $totalScore += $comment->getRating();
                $commentsCount++;
            }
            if($commentsCount!=0) $overallScore = $totalScore/$commentsCount;
            $recipesData[] = [
                'id' => $recipe->getId(),
                'name' => $recipe->getRecipeName(),
                'time' => $recipe->getPrepTime(),
                'amount' => $recipe->getAmount(),
                'score' => $overallScore,
                'image' => $recipe->getRecipePicture()
            ];
    }
    return new JsonResponse($recipesData);
}

    #[Route('/api/recipe/{id}', name: 'app_get_recipe', methods: ['GET'])]
    public function getRecipeDetails(int $id, EntityManagerInterface $entityManager): JsonResponse
    {
        $recipe = $entityManager->getRepository(Recipes::class)->find($id);
        $totalScore = 0;
        $commentsCount = 0;
        $overallScore = 0;
        if (!$recipe) {
            return new JsonResponse(['error' => 'recipe not found'], JsonResponse::HTTP_NOT_FOUND);
        }

        foreach ($recipe->getComments() as $comment){
                $totalScore += $comment->getRating();
                $commentsCount++;
            }
        if($commentsCount!=0) $overallScore = $totalScore/$commentsCount;
        $recipeDateString = $recipe->getRecipeDate()->format('Y-m-d');
        $responseData = [
            'id' => $recipe->getId(),
            'name' => $recipe->getRecipeName(),
            'description' => $recipe->getDescription(),
            'ingredients' => $recipe->getIngredients(),
            'amount' => $recipe->getAmount(),
            'time' => $recipe->getPrepTime(),
            'date' => $recipeDateString,
            'score' => $overallScore,
            
            'comments' => []
        ];
        foreach ($recipe->getComments() as $comment) {
            $responseData['comments'][] = [
                'id' => $comment->getId(),
                'reviewer' => $comment->getCommentUser()->getUserProfile()->getUsername(),
                'rating' => $comment->getRating(),
                'comment' => $comment->getUserComment()
            ];
        }
        return new JsonResponse($responseData, JsonResponse::HTTP_OK);
    }

    #[Route('/api/addrecipe', name: 'app_add_recipe', methods: ['POST'])]
    public function addRecipe(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
        $name = $data['name'];
        $date = new DateTime($data['date']);
        $description = $data['description'];
        $ingredients = $data['ingredients'];
        $amount = $data['amount'];
        $time = $data['time'];

        $recipe = new Recipes();
        
        $imageName = 'kotlet.jpg';
        $recipe->setRecipePicture($imageName);
        
        $recipe->setRecipeName($name);
        $recipe->setRecipeDate($date);
        $recipe->setDescription($description);
        $recipe->setIngredients($ingredients);
        $recipe->setAmount($amount);
        $recipe->setPrepTime($time);
        $recipe->setCommentsAmount(0);
        $recipe->setRecipeUser($this->entityManager->getRepository(User::class)->find(1));
        $this->entityManager->persist($recipe);
        $this->entityManager->flush();

        return new JsonResponse(['status' => 'dodano przepis', 'recipeID' => $recipe->getId()], JsonResponse::HTTP_CREATED);
    }


}
