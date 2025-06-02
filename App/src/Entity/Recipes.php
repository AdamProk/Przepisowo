<?php

namespace App\Entity;

use App\Repository\RecipesRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: RecipesRepository::class)]
class Recipes
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 255)]
    private ?string $recipe_picture = null;

    #[ORM\Column(type: Types::DATETIME_MUTABLE)]
    private ?\DateTimeInterface $recipe_date = null;

    #[ORM\Column]
    private ?int $comments_amount = null;

    #[ORM\Column(length: 255)]
    private ?string $recipe_name = null;

    #[ORM\Column(type: Types::TEXT)]
    private ?string $description = null;

    #[ORM\Column(type: Types::TEXT)]
    private ?string $ingredients = null;

    #[ORM\Column]
    private ?int $prep_time = null;

    #[ORM\Column]
    private ?int $amount = null;

    /**
     * @var Collection<int, Cuisine>
     */
    #[ORM\ManyToMany(targetEntity: Cuisine::class, inversedBy: 'recipe')]
    private Collection $recipe_cuisine;

    #[ORM\ManyToOne(inversedBy: 'recipe')]
    #[ORM\JoinColumn(nullable: false)]
    private ?User $recipe_user = null;

    /**
     * @var Collection<int, Comments>
     */
    #[ORM\OneToMany(targetEntity: Comments::class, mappedBy: 'recipe')]
    private Collection $comments;

    #[ORM\OneToOne(mappedBy: 'recipe', cascade: ['persist', 'remove'])]
    private ?Nutrients $nutrients = null;

    public function __construct()
    {
        $this->recipe_cuisine = new ArrayCollection();
        $this->comments = new ArrayCollection();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getRecipePicture(): ?string
    {
        return $this->recipe_picture;
    }

    public function setRecipePicture(string $recipe_picture): static
    {
        $this->recipe_picture = $recipe_picture;

        return $this;
    }

    public function getRecipeDate(): ?\DateTimeInterface
    {
        return $this->recipe_date;
    }

    public function setRecipeDate(\DateTimeInterface $recipe_date): static
    {
        $this->recipe_date = $recipe_date;

        return $this;
    }

    public function getCommentsAmount(): ?int
    {
        return $this->comments_amount;
    }

    public function setCommentsAmount(int $comments_amount): static
    {
        $this->comments_amount = $comments_amount;

        return $this;
    }

    public function getRecipeName(): ?string
    {
        return $this->recipe_name;
    }

    public function setRecipeName(string $recipe_name): static
    {
        $this->recipe_name = $recipe_name;

        return $this;
    }

    public function getDescription(): ?string
    {
        return $this->description;
    }

    public function setDescription(string $description): static
    {
        $this->description = $description;

        return $this;
    }

    public function getIngredients(): ?string
    {
        return $this->ingredients;
    }

    public function setIngredients(string $ingredients): static
    {
        $this->ingredients = $ingredients;

        return $this;
    }

    public function getPrepTime(): ?int
    {
        return $this->prep_time;
    }

    public function setPrepTime(int $prep_time): static
    {
        $this->prep_time = $prep_time;

        return $this;
    }

    public function getAmount(): ?int
    {
        return $this->amount;
    }

    public function setAmount(int $amount): static
    {
        $this->amount = $amount;

        return $this;
    }

    /**
     * @return Collection<int, Cuisine>
     */
    public function getRecipeCuisine(): Collection
    {
        return $this->recipe_cuisine;
    }

    public function addRecipeCuisine(Cuisine $recipeCuisine): static
    {
        if (!$this->recipe_cuisine->contains($recipeCuisine)) {
            $this->recipe_cuisine->add($recipeCuisine);
        }

        return $this;
    }

    public function removeRecipeCuisine(Cuisine $recipeCuisine): static
    {
        $this->recipe_cuisine->removeElement($recipeCuisine);

        return $this;
    }

    public function getRecipeUser(): ?User
    {
        return $this->recipe_user;
    }

    public function setRecipeUser(?User $recipe_user): static
    {
        $this->recipe_user = $recipe_user;

        return $this;
    }

    /**
     * @return Collection<int, Comments>
     */
    public function getComments(): Collection
    {
        return $this->comments;
    }

    public function addComment(Comments $comment): static
    {
        if (!$this->comments->contains($comment)) {
            $this->comments->add($comment);
            $comment->setRecipe($this);
        }

        return $this;
    }

    public function removeComment(Comments $comment): static
    {
        if ($this->comments->removeElement($comment)) {
            // set the owning side to null (unless already changed)
            if ($comment->getRecipe() === $this) {
                $comment->setRecipe(null);
            }
        }

        return $this;
    }

    public function getNutrients(): ?Nutrients
    {
        return $this->nutrients;
    }

    public function setNutrients(Nutrients $nutrients): static
    {
        // set the owning side of the relation if necessary
        if ($nutrients->getRecipe() !== $this) {
            $nutrients->setRecipe($this);
        }

        $this->nutrients = $nutrients;
        return $this;
    }
}
