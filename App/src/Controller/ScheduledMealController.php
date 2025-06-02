<?php

namespace App\Controller;

use App\Entity\ScheduledMeal;
use App\Entity\Recipes;
use App\Entity\User;
use App\Repository\ScheduledMealRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;

#[Route('/api/scheduled-meals')]
class ScheduledMealController extends AbstractController
{
    private $entityManager;
    private $scheduledMealRepository;

    public function __construct(
        EntityManagerInterface $entityManager,
        ScheduledMealRepository $scheduledMealRepository
    ) {
        $this->entityManager = $entityManager;
        $this->scheduledMealRepository = $scheduledMealRepository;
    }

    #[Route('', name: 'schedule_meal', methods: ['POST'])]
    public function scheduleMeal(Request $request): JsonResponse
    {
        $user = $this->getUser();
        if (!$user) {
            return new JsonResponse(['error' => 'User not authenticated'], JsonResponse::HTTP_UNAUTHORIZED);
        }

        $data = json_decode($request->getContent(), true);
        
        // Validate required fields
        if (!isset($data['recipeId'], $data['scheduledDate'], $data['mealType'], $data['portions'])) {
            return new JsonResponse(['error' => 'Missing required fields'], JsonResponse::HTTP_BAD_REQUEST);
        }

        $recipe = $this->entityManager->getRepository(Recipes::class)->find($data['recipeId']);
        if (!$recipe) {
            return new JsonResponse(['error' => 'Recipe not found'], JsonResponse::HTTP_NOT_FOUND);
        }

        try {
            $scheduledMeal = new ScheduledMeal();
            $scheduledMeal->setUser($user);
            $scheduledMeal->setRecipe($recipe);
            $scheduledMeal->setScheduledDate(new \DateTime($data['scheduledDate']));
            $scheduledMeal->setMealType($data['mealType']);
            $scheduledMeal->setPortions($data['portions']);
            
            if (isset($data['notes'])) {
                $scheduledMeal->setNotes($data['notes']);
            }

            $this->entityManager->persist($scheduledMeal);
            $this->entityManager->flush();

            return new JsonResponse(['message' => 'Meal scheduled successfully'], JsonResponse::HTTP_CREATED);
        } catch (\Exception $e) {
            return new JsonResponse(['error' => $e->getMessage()], JsonResponse::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    #[Route('/{id}', name: 'update_scheduled_meal', methods: ['PUT'])]
    public function updateScheduledMeal(int $id, Request $request): JsonResponse
    {
        $user = $this->getUser();
        if (!$user) {
            return new JsonResponse(['error' => 'User not authenticated'], JsonResponse::HTTP_UNAUTHORIZED);
        }

        $scheduledMeal = $this->scheduledMealRepository->find($id);
        if (!$scheduledMeal) {
            return new JsonResponse(['error' => 'Scheduled meal not found'], JsonResponse::HTTP_NOT_FOUND);
        }

        if ($scheduledMeal->getUser() !== $user) {
            return new JsonResponse(['error' => 'Not authorized'], JsonResponse::HTTP_FORBIDDEN);
        }

        $data = json_decode($request->getContent(), true);

        try {
            if (isset($data['recipeId'])) {
                $recipe = $this->entityManager->getRepository(Recipes::class)->find($data['recipeId']);
                if (!$recipe) {
                    return new JsonResponse(['error' => 'Recipe not found'], JsonResponse::HTTP_NOT_FOUND);
                }
                $scheduledMeal->setRecipe($recipe);
            }

            if (isset($data['scheduledDate'])) {
                $scheduledMeal->setScheduledDate(new \DateTime($data['scheduledDate']));
            }

            if (isset($data['mealType'])) {
                $scheduledMeal->setMealType($data['mealType']);
            }

            if (isset($data['portions'])) {
                $scheduledMeal->setPortions($data['portions']);
            }

            if (isset($data['notes'])) {
                $scheduledMeal->setNotes($data['notes']);
            }

            $scheduledMeal->setUpdatedAt(new \DateTime());
            $this->entityManager->flush();

            return new JsonResponse(['message' => 'Scheduled meal updated successfully']);
        } catch (\Exception $e) {
            return new JsonResponse(['error' => $e->getMessage()], JsonResponse::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    #[Route('/{id}', name: 'delete_scheduled_meal', methods: ['DELETE'])]
    public function deleteScheduledMeal(int $id): JsonResponse
    {
        $user = $this->getUser();
        if (!$user) {
            return new JsonResponse(['error' => 'User not authenticated'], JsonResponse::HTTP_UNAUTHORIZED);
        }

        $scheduledMeal = $this->scheduledMealRepository->find($id);
        if (!$scheduledMeal) {
            return new JsonResponse(['error' => 'Scheduled meal not found'], JsonResponse::HTTP_NOT_FOUND);
        }

        if ($scheduledMeal->getUser() !== $user) {
            return new JsonResponse(['error' => 'Not authorized'], JsonResponse::HTTP_FORBIDDEN);
        }

        try {
            $this->entityManager->remove($scheduledMeal);
            $this->entityManager->flush();

            return new JsonResponse(['message' => 'Scheduled meal deleted successfully']);
        } catch (\Exception $e) {
            return new JsonResponse(['error' => $e->getMessage()], JsonResponse::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    #[Route('/user/range', name: 'get_user_meals_in_range', methods: ['GET'])]
    public function getUserMealsInRange(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $this->getUser();
        if (!$user) {
            return new JsonResponse(['error' => 'User not authenticated'], JsonResponse::HTTP_UNAUTHORIZED);
        }

        $startDate = $request->query->get('startDate');
        $endDate = $request->query->get('endDate');

        if (!$startDate || !$endDate) {
            return new JsonResponse(['error' => 'Start date and end date are required'], JsonResponse::HTTP_BAD_REQUEST);
        }

        try {
            $startDateTime = new \DateTime($startDate);
            $endDateTime = new \DateTime($endDate);

            $meals = $this->scheduledMealRepository->findUserMealsInRange(
                $user->getId(),
                $startDateTime,
                $endDateTime
            );

            $mealsData = array_map(function (ScheduledMeal $meal) {
                return [
                    'id' => $meal->getId(),
                    'recipe' => [
                        'id' => $meal->getRecipe()->getId(),
                        'name' => $meal->getRecipe()->getRecipeName(),
                        'image' => $meal->getRecipe()->getRecipePicture(),
                        'nutrients' => $meal->getRecipe()->getNutrients() ? [
                            'calories' => $meal->getRecipe()->getNutrients()->getCalories(),
                            'proteins' => $meal->getRecipe()->getNutrients()->getProteins(),
                            'carbohydrates' => $meal->getRecipe()->getNutrients()->getCarbohydrates(),
                            'fats' => $meal->getRecipe()->getNutrients()->getFats(),
                            'vitamins' => $meal->getRecipe()->getNutrients()->getVitamins(),
                            'minerals' => $meal->getRecipe()->getNutrients()->getMinerals()
                        ] : null
                    ],
                    'scheduledDate' => $meal->getScheduledDate()->format('Y-m-d H:i:s'),
                    'mealType' => $meal->getMealType(),
                    'portions' => $meal->getPortions(),
                    'notes' => $meal->getNotes()
                ];
            }, $meals);

            return new JsonResponse($mealsData);
        } catch (\Exception $e) {
            return new JsonResponse(['error' => $e->getMessage()], JsonResponse::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    #[Route('/user/nutritional-overview', name: 'get_nutritional_overview', methods: ['GET'])]
    public function getNutritionalOverview(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $this->getUser();
        if (!$user) {
            return new JsonResponse(['error' => 'User not authenticated'], JsonResponse::HTTP_UNAUTHORIZED);
        }

        $startDate = $request->query->get('startDate');
        $endDate = $request->query->get('endDate');

        if (!$startDate || !$endDate) {
            return new JsonResponse(['error' => 'Start date and end date are required'], JsonResponse::HTTP_BAD_REQUEST);
        }

        try {
            $startDateTime = new \DateTime($startDate);
            $endDateTime = new \DateTime($endDate);

            $overview = $this->scheduledMealRepository->calculateNutritionalOverview(
                $user->getId(),
                $startDateTime,
                $endDateTime
            );

            return new JsonResponse($overview);
        } catch (\Exception $e) {
            return new JsonResponse(['error' => $e->getMessage()], JsonResponse::HTTP_INTERNAL_SERVER_ERROR);
        }
    }
} 