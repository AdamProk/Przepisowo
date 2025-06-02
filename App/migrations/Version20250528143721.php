<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20250528143721 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE SEQUENCE scheduled_meal_id_seq INCREMENT BY 1 MINVALUE 1 START 1');
        $this->addSql('CREATE TABLE scheduled_meal (id INT NOT NULL, user_id INT NOT NULL, recipe_id INT NOT NULL, scheduled_date TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL, meal_type VARCHAR(20) NOT NULL, portions DOUBLE PRECISION NOT NULL, notes VARCHAR(255) DEFAULT NULL, created_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL, updated_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL, PRIMARY KEY(id))');
        $this->addSql('CREATE INDEX IDX_5137C9B5A76ED395 ON scheduled_meal (user_id)');
        $this->addSql('CREATE INDEX IDX_5137C9B559D8A214 ON scheduled_meal (recipe_id)');
        $this->addSql('ALTER TABLE scheduled_meal ADD CONSTRAINT FK_5137C9B5A76ED395 FOREIGN KEY (user_id) REFERENCES "user" (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE scheduled_meal ADD CONSTRAINT FK_5137C9B559D8A214 FOREIGN KEY (recipe_id) REFERENCES recipes (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE SCHEMA public');
        $this->addSql('DROP SEQUENCE scheduled_meal_id_seq CASCADE');
        $this->addSql('ALTER TABLE scheduled_meal DROP CONSTRAINT FK_5137C9B5A76ED395');
        $this->addSql('ALTER TABLE scheduled_meal DROP CONSTRAINT FK_5137C9B559D8A214');
        $this->addSql('DROP TABLE scheduled_meal');
    }
}
