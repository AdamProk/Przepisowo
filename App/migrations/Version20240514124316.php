<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20240514124316 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE SEQUENCE comments_id_seq INCREMENT BY 1 MINVALUE 1 START 1');
        $this->addSql('CREATE SEQUENCE cuisine_id_seq INCREMENT BY 1 MINVALUE 1 START 1');
        $this->addSql('CREATE SEQUENCE recipes_id_seq INCREMENT BY 1 MINVALUE 1 START 1');
        $this->addSql('CREATE SEQUENCE "user_id_seq" INCREMENT BY 1 MINVALUE 1 START 1');
        $this->addSql('CREATE TABLE comments (id INT NOT NULL, recipe_id INT NOT NULL, comment_user_id INT NOT NULL, comment VARCHAR(255) NOT NULL, comment_date DATE NOT NULL, rating INT NOT NULL, PRIMARY KEY(id))');
        $this->addSql('CREATE INDEX IDX_5F9E962A59D8A214 ON comments (recipe_id)');
        $this->addSql('CREATE INDEX IDX_5F9E962A541DB185 ON comments (comment_user_id)');
        $this->addSql('CREATE TABLE cuisine (id INT NOT NULL, cuisine VARCHAR(255) NOT NULL, PRIMARY KEY(id))');
        $this->addSql('CREATE TABLE recipes (id INT NOT NULL, recipe_user_id INT NOT NULL, recipe_picture VARCHAR(255) NOT NULL, recipe_date DATE NOT NULL, comments_amount INT NOT NULL, recipe_name VARCHAR(255) NOT NULL, description VARCHAR(255) NOT NULL, ingredients VARCHAR(255) NOT NULL, prep_time INT NOT NULL, amount INT NOT NULL, PRIMARY KEY(id))');
        $this->addSql('CREATE INDEX IDX_A369E2B5EB8ADDD5 ON recipes (recipe_user_id)');
        $this->addSql('CREATE TABLE recipes_cuisine (recipes_id INT NOT NULL, cuisine_id INT NOT NULL, PRIMARY KEY(recipes_id, cuisine_id))');
        $this->addSql('CREATE INDEX IDX_76C8193FFDF2B1FA ON recipes_cuisine (recipes_id)');
        $this->addSql('CREATE INDEX IDX_76C8193FED4BAC14 ON recipes_cuisine (cuisine_id)');
        $this->addSql('CREATE TABLE "user" (id INT NOT NULL, email VARCHAR(180) NOT NULL, roles JSON NOT NULL, password VARCHAR(255) NOT NULL, name VARCHAR(255) NOT NULL, profile_picture VARCHAR(255) NOT NULL, PRIMARY KEY(id))');
        $this->addSql('CREATE UNIQUE INDEX UNIQ_IDENTIFIER_EMAIL ON "user" (email)');
        $this->addSql('ALTER TABLE comments ADD CONSTRAINT FK_5F9E962A59D8A214 FOREIGN KEY (recipe_id) REFERENCES recipes (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE comments ADD CONSTRAINT FK_5F9E962A541DB185 FOREIGN KEY (comment_user_id) REFERENCES "user" (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE recipes ADD CONSTRAINT FK_A369E2B5EB8ADDD5 FOREIGN KEY (recipe_user_id) REFERENCES "user" (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE recipes_cuisine ADD CONSTRAINT FK_76C8193FFDF2B1FA FOREIGN KEY (recipes_id) REFERENCES recipes (id) ON DELETE CASCADE NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE recipes_cuisine ADD CONSTRAINT FK_76C8193FED4BAC14 FOREIGN KEY (cuisine_id) REFERENCES cuisine (id) ON DELETE CASCADE NOT DEFERRABLE INITIALLY IMMEDIATE');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE SCHEMA public');
        $this->addSql('DROP SEQUENCE comments_id_seq CASCADE');
        $this->addSql('DROP SEQUENCE cuisine_id_seq CASCADE');
        $this->addSql('DROP SEQUENCE recipes_id_seq CASCADE');
        $this->addSql('DROP SEQUENCE "user_id_seq" CASCADE');
        $this->addSql('ALTER TABLE comments DROP CONSTRAINT FK_5F9E962A59D8A214');
        $this->addSql('ALTER TABLE comments DROP CONSTRAINT FK_5F9E962A541DB185');
        $this->addSql('ALTER TABLE recipes DROP CONSTRAINT FK_A369E2B5EB8ADDD5');
        $this->addSql('ALTER TABLE recipes_cuisine DROP CONSTRAINT FK_76C8193FFDF2B1FA');
        $this->addSql('ALTER TABLE recipes_cuisine DROP CONSTRAINT FK_76C8193FED4BAC14');
        $this->addSql('DROP TABLE comments');
        $this->addSql('DROP TABLE cuisine');
        $this->addSql('DROP TABLE recipes');
        $this->addSql('DROP TABLE recipes_cuisine');
        $this->addSql('DROP TABLE "user"');
    }
}
