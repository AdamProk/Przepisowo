<?php

namespace App\Entity;

use App\Repository\NutrientsRepository;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: NutrientsRepository::class)]
class Nutrients
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column]
    private ?int $calories = null;

    #[ORM\Column(nullable: true)]
    private ?float $proteins = null;

    #[ORM\Column(nullable: true)]
    private ?float $carbohydrates = null;

    #[ORM\Column(nullable: true)]
    private ?float $fats = null;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $vitamins = null;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $minerals = null;

    #[ORM\OneToOne(inversedBy: 'nutrients')]
    #[ORM\JoinColumn(nullable: false)]
    private ?Recipes $recipe = null;

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getCalories(): ?int
    {
        return $this->calories;
    }

    public function setCalories(int $calories): static
    {
        $this->calories = $calories;
        return $this;
    }

    public function getProteins(): ?float
    {
        return $this->proteins;
    }

    public function setProteins(?float $proteins): static
    {
        $this->proteins = $proteins;
        return $this;
    }

    public function getCarbohydrates(): ?float
    {
        return $this->carbohydrates;
    }

    public function setCarbohydrates(?float $carbohydrates): static
    {
        $this->carbohydrates = $carbohydrates;
        return $this;
    }

    public function getFats(): ?float
    {
        return $this->fats;
    }

    public function setFats(?float $fats): static
    {
        $this->fats = $fats;
        return $this;
    }

    public function getVitamins(): ?string
    {
        return $this->vitamins;
    }

    public function setVitamins(?string $vitamins): static
    {
        $this->vitamins = $vitamins;
        return $this;
    }

    public function getMinerals(): ?string
    {
        return $this->minerals;
    }

    public function setMinerals(?string $minerals): static
    {
        $this->minerals = $minerals;
        return $this;
    }

    public function getRecipe(): ?Recipes
    {
        return $this->recipe;
    }

    public function setRecipe(Recipes $recipe): static
    {
        $this->recipe = $recipe;
        return $this;
    }
} 