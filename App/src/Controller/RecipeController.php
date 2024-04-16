<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

class RecipeController extends AbstractController
{
    #[Route('/recipe', name: 'app_recipe')]
    public function recipe(): Response
    {
        return $this->render('recipe/index.html.twig', [
            'controller_name' => 'RecipeController',
        ]);
    }
    #[Route('/add_recipe', name: 'app_add_recipe')]
    public function addrecipe(): Response
    {
        return $this->render('addrecipe/index.html.twig', [
            'controller_name' => 'RecipeController',
        ]);
    }
}
