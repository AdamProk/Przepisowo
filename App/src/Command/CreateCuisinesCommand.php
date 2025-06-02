<?php

namespace App\Command;

use App\Entity\Cuisine;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;

#[AsCommand(
    name: 'app:create-cuisines',
    description: 'Creates default cuisines in the database',
)]
class CreateCuisinesCommand extends Command
{
    public function __construct(
        private EntityManagerInterface $entityManager,
    ) {
        parent::__construct();
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $io = new SymfonyStyle($input, $output);

        $cuisines = [
            'polska',
            'włoska',
            'japońska',
            'chińska',
            'koreańska',
            'amerykańska',
            'francuska',
            'meksykańska',
            'inna'
        ];

        foreach ($cuisines as $cuisineName) {
            $existingCuisine = $this->entityManager->getRepository(Cuisine::class)->findOneBy(['cuisine' => $cuisineName]);
            
            if (!$existingCuisine) {
                $cuisine = new Cuisine();
                $cuisine->setCuisine($cuisineName);
                $this->entityManager->persist($cuisine);
                $io->success(sprintf('Cuisine %s created successfully', $cuisineName));
            } else {
                $io->note(sprintf('Cuisine %s already exists', $cuisineName));
            }
        }

        $this->entityManager->flush();

        return Command::SUCCESS;
    }
} 