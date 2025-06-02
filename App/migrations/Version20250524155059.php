<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20250524155059 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE SEQUENCE nutrients_id_seq INCREMENT BY 1 MINVALUE 1 START 1');
        $this->addSql('CREATE TABLE nutrients (id INT NOT NULL, recipe_id INT NOT NULL, calories INT NOT NULL, proteins DOUBLE PRECISION DEFAULT NULL, carbohydrates DOUBLE PRECISION DEFAULT NULL, fats DOUBLE PRECISION DEFAULT NULL, vitamins VARCHAR(255) DEFAULT NULL, minerals VARCHAR(255) DEFAULT NULL, PRIMARY KEY(id))');
        $this->addSql('CREATE UNIQUE INDEX UNIQ_9019E1CD59D8A214 ON nutrients (recipe_id)');
        $this->addSql('ALTER TABLE nutrients ADD CONSTRAINT FK_9019E1CD59D8A214 FOREIGN KEY (recipe_id) REFERENCES recipes (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE SCHEMA public');
        $this->addSql('DROP SEQUENCE nutrients_id_seq CASCADE');
        $this->addSql('ALTER TABLE nutrients DROP CONSTRAINT FK_9019E1CD59D8A214');
        $this->addSql('DROP TABLE nutrients');
    }
}
